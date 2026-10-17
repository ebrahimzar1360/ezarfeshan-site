'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { Project } from '@/lib/content/projects'
import { ProjectLink } from '../ProjectCard'
import { ProjectMock } from '../ProjectMock'
import { reducedMotion, shouldSkip3d, webglAvailable, whenNear } from '../three/gate'

export type RoadmapItem = { project: Project; picture: string | null }

/**
 * "پروژه‌های در حال توسعه" as the RCA site lays out "از ایده تا محصول": the
 * projects as a timeline grouped by their status (today all «در حال توسعه»,
 * exactly as the CMS says), and beside it a path of light with a station per
 * project carrying its picture (projects-scene.ts).
 *
 * Hovering, focusing or tapping a project brings its station forward; when
 * nobody is choosing, the stage walks through them on its own. Before the
 * scene loads, and wherever WebGL is missing, the stage shows the chosen
 * project's picture instead.
 */
export function ProjectsRoadmap({ items }: { items: RoadmapItem[] }) {
  const [active, setActive] = useState(0)
  const [live, setLive] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<{ setActive: (i: number, byUser?: boolean) => void; dispose: () => void } | null>(null)
  const touched = useRef(0)

  const choose = (i: number) => {
    touched.current = performance.now()
    setActive(i)
    sceneRef.current?.setActive(i, true)
  }

  // walk through the projects while the visitor is not choosing
  useEffect(() => {
    if (items.length < 2 || reducedMotion()) return
    const id = window.setInterval(() => {
      if (performance.now() - touched.current < 9000) return
      const root = rootRef.current
      if (!root) return
      const r = root.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return
      setActive((a) => {
        const next = (a + 1) % items.length
        sceneRef.current?.setActive(next)
        return next
      })
    }, 4500)
    return () => window.clearInterval(id)
  }, [items.length])

  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root || shouldSkip3d() || !webglAvailable()) return
    let cancelled = false
    const cancelNear = whenNear(root, () => {
      import('./projects-scene')
        .then(({ mountProjectsScene }) => {
          if (cancelled) return
          sceneRef.current = mountProjectsScene({
            canvas,
            host: root,
            pictures: items.map((it) => it.picture),
            still: reducedMotion(),
            onReady: () => setLive(true),
            onLost: () => {
              sceneRef.current = null
              setLive(false)
            },
            onPick: (i) => choose(i),
          })
        })
        .catch(() => {
          // the pictures stay as the stage
        })
    })
    return () => {
      cancelled = true
      cancelNear()
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // group by status, keeping the CMS order
  const groups: { status: string; rows: { it: RoadmapItem; i: number }[] }[] = []
  items.forEach((it, i) => {
    const status = it.project.status
    let g = groups.find((x) => x.status === status)
    if (!g) groups.push((g = { status, rows: [] }))
    g.rows.push({ it, i })
  })

  return (
    <div ref={rootRef} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12" data-live={live || undefined}>
      <div className="relative h-[46svh] max-h-[26rem] min-h-[18rem] lg:order-last lg:h-[34rem] lg:max-h-none">
        {items.map((it, i) => (
          <div key={it.project.slug} aria-hidden className={`pj-poster absolute inset-0 grid place-items-center ${i === active ? 'is-on' : ''}`}>
            <div className="card-v3 w-4/5 overflow-hidden">
              {it.picture && !it.project.image ? (
                <Image src={it.picture} alt="" width={1280} height={800} sizes="(min-width: 1024px) 28rem, 80vw" className="aspect-[8/5] w-full object-cover" />
              ) : (
                <ProjectMock project={it.project} />
              )}
            </div>
          </div>
        ))}
        <canvas ref={canvasRef} aria-hidden className="pj-canvas absolute inset-0 size-full cursor-pointer" />
      </div>

      <div className="card-v3 p-6 md:p-9" data-reveal>
        <ol className="rm-roadmap">
          {groups.map((g) => (
            <li key={g.status || 'none'}>
              {g.status && (
                <p className="rm-status">
                  <i aria-hidden />
                  {g.status}
                </p>
              )}
              <ul className="mt-3 grid gap-3">
                {g.rows.map(({ it, i }) => (
                  <li
                    key={it.project.slug}
                    className={`rm-item ${i === active ? 'is-on' : ''}`}
                    onMouseEnter={() => choose(i)}
                    onFocus={() => choose(i)}
                    onClick={() => choose(i)}
                  >
                    <span aria-hidden className="rm-thumb">
                      {it.picture ? (
                        <Image
                          src={it.picture}
                          alt=""
                          width={160}
                          height={100}
                          sizes="5rem"
                          className={`size-full ${it.project.image?.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                        />
                      ) : (
                        <span className="block size-full bg-bg-band" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <b className="block text-400 font-extrabold leading-snug">{it.project.title}</b>
                      {it.project.text && <span className="mt-1 block text-300 leading-normal text-text-muted">{it.project.text}</span>}
                      {it.project.link && <ProjectLink link={it.project.link} className="mt-2" />}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
