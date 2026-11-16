Add-Type -AssemblyName System.Drawing

$assetsDir = Resolve-Path "public\assets"
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }

function Save-JpegCompressed {
    param(
        [System.Drawing.Image]$Image,
        [string]$DestinationPath,
        [long]$Quality = 82
    )
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
    
    $tempFile = [System.IO.Path]::GetTempFileName()
    $Image.Save($tempFile, $jpegCodec, $encoderParams)
    Copy-Item -Path $tempFile -Destination $DestinationPath -Force
    Remove-Item -Path $tempFile -Force
}

function Create-OgImage {
    param(
        [string]$SourceFile,
        [string]$DestFile,
        [int]$TargetWidth = 1200,
        [int]$TargetHeight = 630,
        [long]$Quality = 82
    )
    $srcPath = Join-Path $assetsDir $SourceFile
    $destPath = Join-Path $assetsDir $DestFile
    
    $bytes = [System.IO.File]::ReadAllBytes($srcPath)
    $ms = New-Object System.IO.MemoryStream(, $bytes)
    $srcImg = [System.Drawing.Image]::FromStream($ms)
    try {
        $targetRatio = $TargetWidth / $TargetHeight
        $srcRatio = $srcImg.Width / $srcImg.Height
        
        $srcX = 0
        $srcY = 0
        $srcW = $srcImg.Width
        $srcH = $srcImg.Height
        
        if ($srcRatio -gt $targetRatio) {
            # Source is wider than target: crop sides
            $srcW = [int]($srcImg.Height * $targetRatio)
            $srcX = [int](($srcImg.Width - $srcW) / 2)
        }
        else {
            # Source is taller than target: crop top/bottom
            $srcH = [int]($srcImg.Width / $targetRatio)
            $srcY = [int](($srcImg.Height - $srcH) / 2)
        }
        
        $destBmp = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight)
        $gfx = [System.Drawing.Graphics]::FromImage($destBmp)
        try {
            $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            $destRect = New-Object System.Drawing.Rectangle(0, 0, $TargetWidth, $TargetHeight)
            $srcRect = New-Object System.Drawing.Rectangle($srcX, $srcY, $srcW, $srcH)
            
            $gfx.DrawImage($srcImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
            Save-JpegCompressed -Image $destBmp -DestinationPath $destPath -Quality $Quality
            Write-Host "Created OG image: $DestFile ($TargetWidth x $TargetHeight)"
        }
        finally {
            $gfx.Dispose()
            $destBmp.Dispose()
        }
    }
    finally {
        $srcImg.Dispose()
        $ms.Dispose()
    }
}

# 1. Generate 1200x630 OG Images
Create-OgImage -SourceFile "yashdeep-exterior.jpg" -DestFile "og-home.jpg"
Create-OgImage -SourceFile "yashdeep-deluxe.jpg" -DestFile "og-deluxe.jpg"
Create-OgImage -SourceFile "yashdeep-luxury.jpg" -DestFile "og-luxury.jpg"
Create-OgImage -SourceFile "restaurant3.jpg" -DestFile "og-restaurant.jpg"
Create-OgImage -SourceFile "yashdeep-meeting.jpg" -DestFile "og-meetings.jpg"
Create-OgImage -SourceFile "yashdeep-reception.jpg" -DestFile "og-contact.jpg"

# 2. Compress existing JPEGs in public/assets (excluding og-*.jpg)
$existingJpegs = Get-ChildItem -Path $assetsDir -Filter "*.jpg" | Where-Object { $_.Name -notlike "og-*.jpg" }
foreach ($file in $existingJpegs) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $ms = New-Object System.IO.MemoryStream(, $bytes)
    $img = [System.Drawing.Image]::FromStream($ms)
    try {
        $targetW = $img.Width
        $targetH = $img.Height
        if ($img.Width -gt 1600) {
            $targetW = 1600
            $targetH = [int]($img.Height * (1600.0 / $img.Width))
        }
        
        $resizedBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
        $gfx = [System.Drawing.Graphics]::FromImage($resizedBmp)
        try {
            $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $gfx.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
            $gfx.DrawImage($img, $destRect, 0, 0, $img.Width, $img.Height, [System.Drawing.GraphicsUnit]::Pixel)
            
            Save-JpegCompressed -Image $resizedBmp -DestinationPath $file.FullName -Quality 82
            Write-Host "Compressed: $($file.Name)"
        }
        finally {
            $gfx.Dispose()
            $resizedBmp.Dispose()
        }
    }
    finally {
        $img.Dispose()
        $ms.Dispose()
    }
}
Write-Host "Completed image compression and OG generation successfully."
