// Minimal TTF glyf -> SVG path extractor. No dependencies.
const fs = require('fs');

function parse(file) {
  const b = fs.readFileSync(file);
  const numTables = b.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    tables[b.slice(o, o + 4).toString('latin1')] = { off: b.readUInt32BE(o + 8), len: b.readUInt32BE(o + 12) };
  }
  const head = tables.head.off;
  const unitsPerEm = b.readUInt16BE(head + 18);
  const indexToLocFormat = b.readInt16BE(head + 50);
  const numGlyphs = b.readUInt16BE(tables.maxp.off + 4);

  // loca
  const loca = [];
  for (let i = 0; i <= numGlyphs; i++) {
    loca.push(indexToLocFormat === 0
      ? b.readUInt16BE(tables.loca.off + i * 2) * 2
      : b.readUInt32BE(tables.loca.off + i * 4));
  }

  // cmap -> prefer format 4 unicode
  const cm = tables.cmap.off;
  const nSub = b.readUInt16BE(cm + 2);
  let best = null;
  for (let i = 0; i < nSub; i++) {
    const rec = cm + 4 + i * 8;
    const platID = b.readUInt16BE(rec), encID = b.readUInt16BE(rec + 2);
    const sub = cm + b.readUInt32BE(rec + 4);
    const fmt = b.readUInt16BE(sub);
    if (fmt === 4 && (platID === 3 || platID === 0)) best = { sub, fmt };
    if (fmt === 12 && !best) best = { sub, fmt };
  }
  function gidFor(cp) {
    const { sub, fmt } = best;
    if (fmt === 4) {
      const segX2 = b.readUInt16BE(sub + 6), seg = segX2 / 2;
      const endO = sub + 14, startO = endO + segX2 + 2, deltaO = startO + segX2, rangeO = deltaO + segX2;
      for (let s = 0; s < seg; s++) {
        const end = b.readUInt16BE(endO + s * 2);
        if (cp > end) continue;
        const start = b.readUInt16BE(startO + s * 2);
        if (cp < start) return 0;
        const delta = b.readInt16BE(deltaO + s * 2);
        const ro = b.readUInt16BE(rangeO + s * 2);
        if (ro === 0) return (cp + delta) & 0xffff;
        const gi = b.readUInt16BE(rangeO + s * 2 + ro + (cp - start) * 2);
        return gi === 0 ? 0 : (gi + delta) & 0xffff;
      }
      return 0;
    }
    const nGroups = b.readUInt32BE(sub + 12);
    for (let g = 0; g < nGroups; g++) {
      const o = sub + 16 + g * 12;
      const s = b.readUInt32BE(o), e = b.readUInt32BE(o + 4);
      if (cp >= s && cp <= e) return b.readUInt32BE(o + 8) + (cp - s);
    }
    return 0;
  }

  function contoursFor(gid) {
    const start = tables.glyf.off + loca[gid], end = tables.glyf.off + loca[gid + 1];
    if (end <= start) return { contours: [], bbox: [0, 0, 0, 0] };
    const nc = b.readInt16BE(start);
    const bbox = [b.readInt16BE(start + 2), b.readInt16BE(start + 4), b.readInt16BE(start + 6), b.readInt16BE(start + 8)];
    if (nc < 0) throw new Error('composite glyph not supported (gid ' + gid + ')');
    let p = start + 10;
    const ends = [];
    for (let i = 0; i < nc; i++) { ends.push(b.readUInt16BE(p)); p += 2; }
    const nPts = ends[nc - 1] + 1;
    p += 2 + b.readUInt16BE(p); // skip instructions
    const flags = [];
    while (flags.length < nPts) {
      const f = b.readUInt8(p++); flags.push(f);
      if (f & 8) { let r = b.readUInt8(p++); while (r-- > 0) flags.push(f); }
    }
    const xs = [], ys = [];
    let v = 0;
    for (let i = 0; i < nPts; i++) {
      const f = flags[i];
      if (f & 2) { const d = b.readUInt8(p++); v += (f & 16) ? d : -d; }
      else if (!(f & 16)) { v += b.readInt16BE(p); p += 2; }
      xs.push(v);
    }
    v = 0;
    for (let i = 0; i < nPts; i++) {
      const f = flags[i];
      if (f & 4) { const d = b.readUInt8(p++); v += (f & 32) ? d : -d; }
      else if (!(f & 32)) { v += b.readInt16BE(p); p += 2; }
      ys.push(v);
    }
    const contours = [];
    let s = 0;
    for (let c = 0; c < nc; c++) {
      const e = ends[c], pts = [];
      for (let i = s; i <= e; i++) pts.push({ x: xs[i], y: ys[i], on: !!(flags[i] & 1) });
      contours.push(pts); s = e + 1;
    }
    return { contours, bbox };
  }

  const numHM = b.readUInt16BE(tables.hhea.off + 34);
  function advanceFor(gid) {
    const i = Math.min(gid, numHM - 1);
    return b.readUInt16BE(tables.hmtx.off + i * 4);
  }
  function lsbFor(gid) {
    if (gid < numHM) return b.readInt16BE(tables.hmtx.off + gid * 4 + 2);
    return b.readInt16BE(tables.hmtx.off + numHM * 4 + (gid - numHM) * 2);
  }
  return { unitsPerEm, gidFor, contoursFor, advanceFor, lsbFor };
}

// quadratic TrueType contours -> SVG path data, y flipped (SVG y-down)
function toPath(contours, scale, dx, dy) {
  const X = p => (p.x * scale + dx).toFixed(2);
  const Y = p => (-p.y * scale + dy).toFixed(2);
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, on: true });
  let d = '';
  for (const raw of contours) {
    if (!raw.length) continue;
    // rotate so we start on an on-curve point
    let pts = raw.slice();
    let si = pts.findIndex(p => p.on);
    if (si === -1) { pts.unshift(mid(pts[pts.length - 1], pts[0])); si = 0; }
    pts = pts.slice(si).concat(pts.slice(0, si));
    d += `M${X(pts[0])} ${Y(pts[0])}`;
    let i = 1;
    while (i <= pts.length) {
      const cur = pts[i % pts.length];
      if (cur.on) { d += `L${X(cur)} ${Y(cur)}`; i++; continue; }
      const next = pts[(i + 1) % pts.length];
      const endPt = next.on ? next : mid(cur, next);
      d += `Q${X(cur)} ${Y(cur)} ${X(endPt)} ${Y(endPt)}`;
      i += next.on ? 2 : 1;
    }
    d += 'Z';
  }
  return d;
}

const [, , fontPath, chars, scaleArg] = process.argv;
const f = parse(fontPath);
const scale = parseFloat(scaleArg || '1') / f.unitsPerEm;
console.log('# unitsPerEm=' + f.unitsPerEm + '  scale=' + scale.toFixed(6));
for (const ch of chars) {
  const gid = f.gidFor(ch.codePointAt(0));
  const { contours, bbox } = f.contoursFor(gid);
  const p = toPath(contours, scale, 0, 0);
  // bbox and advance reported in the SAME normalized space as the path data
  const sb = bbox.map(v => +(v * scale).toFixed(2));
  console.log(`\n## '${ch}' gid=${gid} bbox=[${sb.join(',')}] adv=${(f.advanceFor(gid) * scale).toFixed(2)} lsb=${(f.lsbFor(gid) * scale).toFixed(2)}`);
  console.log(p);
}
