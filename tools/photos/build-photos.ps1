# Crops and colour-corrects the source portraits into public/photos.
# ASCII only: PowerShell 5.1 reads a BOM-less script as CP1252, so a UTF-8
# em-dash or curly quote decodes into a stray quote character and the parse
# fails somewhere far from the real line. Keep this file plain ASCII.
#
#   powershell -File tools/photos/build-photos.ps1
#
# Two of the three sources were shot under purple/violet LED lighting. Purple is
# the single colour the design plan rules out, and it clashes badly with the
# forest sections. Desaturation alone was not enough: at 18% saturation the
# stronger source still measured a 20-point channel skew toward blue.
#
# So the fix is a white balance first -- measure the cast off a background patch,
# scale the channels back to neutral -- and only a light desaturation after.
# Correcting the cast keeps skin tone alive, which heavy desaturation does not.

Add-Type -AssemblyName System.Drawing

$SRC = "c:\Users\Nadimico.com\Desktop\My websait\brand-source\photos"
$OUT = "c:\Users\Nadimico.com\Desktop\My websait\public\photos"
New-Item -ItemType Directory -Force -Path $OUT | Out-Null

# Average colour of a background patch, used to detect the cast.
function Get-Cast($img, [int]$x0, [int]$y0, [int]$x1, [int]$y1) {
  $r = 0.0; $g = 0.0; $b = 0.0; $n = 0
  for ($y = $y0; $y -lt $y1; $y += 5) {
    for ($x = $x0; $x -lt $x1; $x += 5) {
      $p = $img.GetPixel($x, $y); $r += $p.R; $g += $p.G; $b += $p.B; $n++
    }
  }
  # assign first: inside @(...) the comma binds tighter than /, so
  # @($r / $n, $g / $n, ...) parses as $r / ($n, $g) / ... and throws
  $ar = $r / $n
  $ag = $g / $n
  $ab = $b / $n
  return @($ar, $ag, $ab)
}

function New-CorrectionMatrix([double]$gr, [double]$gg, [double]$gb, [single]$sat) {
  # Gain must be applied BEFORE saturation, and GDI+ multiplies a row vector
  # [r g b a 1] by the matrix -- so out_r reads down column 0. Composing
  # M = Gain x Saturation means scaling each ROW by its gain. Scaling the
  # columns instead applies the gain to the already-desaturated value, which
  # over-corrects by 1/sat and flips a blue cast into a yellow one.
  $lr = 0.3086; $lg = 0.6094; $lb = 0.0820
  $sr = (1 - $sat) * $lr; $sg = (1 - $sat) * $lg; $sb = (1 - $sat) * $lb
  $m = New-Object System.Drawing.Imaging.ColorMatrix
  $m.Matrix00 = $gr * ($sr + $sat); $m.Matrix01 = $gr * $sr;         $m.Matrix02 = $gr * $sr
  $m.Matrix10 = $gg * $sg;          $m.Matrix11 = $gg * ($sg + $sat); $m.Matrix12 = $gg * $sg
  $m.Matrix20 = $gb * $sb;          $m.Matrix21 = $gb * $sb;         $m.Matrix22 = $gb * ($sb + $sat)
  $m.Matrix33 = 1; $m.Matrix44 = 1
  return $m
}

function Convert-Photo {
  param($In, $Out, [int]$CropX, [int]$CropY, [int]$CropW, [int]$CropH,
        [int]$OutW, [int]$OutH, [single]$Sat,
        [int]$PatchX0, [int]$PatchY0, [int]$PatchX1, [int]$PatchY1,
        [int]$Quality = 90)

  $src = [System.Drawing.Bitmap]::FromFile($In)

  $cast = Get-Cast $src $PatchX0 $PatchY0 $PatchX1 $PatchY1
  $target = ($cast[0] + $cast[1] + $cast[2]) / 3.0
  $gr = $target / $cast[0]; $gg = $target / $cast[1]; $gb = $target / $cast[2]

  $dst = New-Object System.Drawing.Bitmap -ArgumentList $OutW, $OutH
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $ia = New-Object System.Drawing.Imaging.ImageAttributes
  $ia.SetColorMatrix((New-CorrectionMatrix $gr $gg $gb $Sat))
  $rect = New-Object System.Drawing.Rectangle -ArgumentList 0, 0, $OutW, $OutH
  $g.DrawImage($src, $rect, $CropX, $CropY, $CropW, $CropH, [System.Drawing.GraphicsUnit]::Pixel, $ia)
  $g.Dispose()

  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters -ArgumentList 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter -ArgumentList ([System.Drawing.Imaging.Encoder]::Quality), ([long]$Quality)
  $dst.Save($Out, $enc, $ep)
  $dst.Dispose(); $src.Dispose()

  Write-Output ("{0,-24} {1}x{2}  gains R{3:N2} G{4:N2} B{5:N2}  sat {6}  {7} KB" -f `
    (Split-Path $Out -Leaf), $OutW, $OutH, $gr, $gg, $gb, $Sat, [math]::Round((Get-Item $Out).Length / 1KB))
}

# IMG_0242 -- tighter, warmer frame. Background patch: upper-left wall, clear of the subject.
Convert-Photo -In "$SRC\IMG_0242.jpeg" -Out "$OUT\portrait-about.jpg" `
  -CropX 60 -CropY 120 -CropW 1030 -CropH 1373 -OutW 1030 -OutH 1373 -Sat 0.55 `
  -PatchX0 30 -PatchY0 60 -PatchX1 300 -PatchY1 420

Convert-Photo -In "$SRC\IMG_0242.jpeg" -Out "$OUT\portrait-square.jpg" `
  -CropX 302 -CropY 296 -CropW 620 -CropH 620 -OutW 620 -OutH 620 -Sat 0.55 `
  -PatchX0 30 -PatchY0 60 -PatchX1 300 -PatchY1 420

# IMG_0241 -- wider frame showing the workspace.
Convert-Photo -In "$SRC\IMG_0241.jpeg" -Out "$OUT\portrait-office.jpg" `
  -CropX 20 -CropY 100 -CropW 1080 -CropH 1350 -OutW 1080 -OutH 1350 -Sat 0.55 `
  -PatchX0 30 -PatchY0 60 -PatchX1 300 -PatchY1 400

# IMG_7056 -- studio, neutral grey backdrop already; the balance pass is a no-op here.
Convert-Photo -In "$SRC\IMG_7056.jpeg" -Out "$OUT\portrait-studio.jpg" `
  -CropX 0 -CropY 60 -CropW 997 -CropH 1330 -OutW 997 -OutH 1330 -Sat 0.7 `
  -PatchX0 30 -PatchY0 60 -PatchX1 260 -PatchY1 400
