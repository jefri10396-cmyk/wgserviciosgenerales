param(
    [string]$SourceDir = "img",
    [string]$OutputDir = "img/optimized",
    [string]$HtmlPath = "index.html",
    [int]$Quality = 90,
    [int]$MaxWidth = 2400,
    [int]$MaxHeight = 1800,
    [int]$LogoMaxWidth = 1200,
    [int]$LogoMaxHeight = 900,
    [switch]$UpdateHtml
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourceDir)) {
    throw "Source directory not found: $SourceDir"
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Add-Type -AssemblyName System.Drawing

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" }

if (-not $jpegCodec) {
    throw "JPEG encoder not found."
}

$qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
$jpegParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$jpegParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($qualityEncoder, [int64]$Quality)

$files = Get-ChildItem $SourceDir -File | Where-Object {
    $_.Extension.ToLowerInvariant() -in @(".jpg", ".jpeg", ".png")
}

$results = @()

foreach ($file in $files) {
    $ext = $file.Extension.ToLowerInvariant()
    $inputPath = $file.FullName
    $outputPath = Join-Path $OutputDir $file.Name

    $img = [System.Drawing.Image]::FromFile($inputPath)
    try {
        $targetW = $MaxWidth
        $targetH = $MaxHeight

        if ($file.Name -ieq "logo.png") {
            $targetW = $LogoMaxWidth
            $targetH = $LogoMaxHeight
        }

        $ratio = [Math]::Min($targetW / $img.Width, $targetH / $img.Height)
        if ($ratio -gt 1) { $ratio = 1 }

        $newW = [int][Math]::Round($img.Width * $ratio)
        $newH = [int][Math]::Round($img.Height * $ratio)

        $bmp = New-Object System.Drawing.Bitmap($newW, $newH)
        try {
            $g = [System.Drawing.Graphics]::FromImage($bmp)
            try {
                $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $g.DrawImage($img, 0, 0, $newW, $newH)
            } finally {
                $g.Dispose()
            }

            if ($ext -in @(".jpg", ".jpeg")) {
                $bmp.Save($outputPath, $jpegCodec, $jpegParams)
            } else {
                $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            }
        } finally {
            $bmp.Dispose()
        }
    } finally {
        $img.Dispose()
    }

    $origBytes = $file.Length
    $optBytes = (Get-Item $outputPath).Length

    # If optimized file got larger, keep original bytes to avoid regressions.
    if ($optBytes -ge $origBytes) {
        Copy-Item $inputPath $outputPath -Force
        $optBytes = (Get-Item $outputPath).Length
    }

    $savedBytes = $origBytes - $optBytes
    $savedPct = if ($origBytes -gt 0) { [Math]::Round(($savedBytes / $origBytes) * 100, 1) } else { 0 }

    $results += [PSCustomObject]@{
        Name     = $file.Name
        OrigKB   = [Math]::Round($origBytes / 1KB, 1)
        OptKB    = [Math]::Round($optBytes / 1KB, 1)
        SavedKB  = [Math]::Round($savedBytes / 1KB, 1)
        SavedPct = $savedPct
    }
}

if ($UpdateHtml) {
    if (-not (Test-Path $HtmlPath)) {
        throw "HTML file not found: $HtmlPath"
    }

    $content = Get-Content -Raw $HtmlPath
    $updated = [regex]::Replace($content, 'src="img/(?!optimized/)', 'src="img/optimized/')

    if ($updated -ne $content) {
        Set-Content -Path $HtmlPath -Value $updated -Encoding UTF8
        Write-Host "Updated image src paths in $HtmlPath"
    } else {
        Write-Host "No image src updates needed in $HtmlPath"
    }
}

$results | Sort-Object SavedKB -Descending | Format-Table -AutoSize

$sumOrig = ($results | Measure-Object OrigKB -Sum).Sum
$sumOpt = ($results | Measure-Object OptKB -Sum).Sum
$sumSaved = $sumOrig - $sumOpt
$sumSavedPct = if ($sumOrig -gt 0) { [Math]::Round(($sumSaved / $sumOrig) * 100, 1) } else { 0 }

Write-Host ""
Write-Host ("TOTAL OrigKB={0} OptKB={1} SavedKB={2} SavedPct={3}" -f `
    [Math]::Round($sumOrig, 1), `
    [Math]::Round($sumOpt, 1), `
    [Math]::Round($sumSaved, 1), `
    $sumSavedPct)
