param(
    [int]$Port = 3001
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$outDir = Join-Path $scriptDir "frontend\out"

if (!(Test-Path $outDir)) {
    Write-Error "frontend/out directory not found at $outDir"
    exit 1
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " VAJRA / INDIGO Local Frontend Server is Live!" -ForegroundColor Cyan
    Write-Host "   URL: http://localhost:$Port" -ForegroundColor Yellow
    Write-Host "   URL: http://127.0.0.1:$Port" -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Green

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        $response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 204
            $response.Close()
            continue
        }

        $rawPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq '/') {
            $rawPath = "index.html"
        }

        # Resolve target file path
        $targetFile = $null
        $candidate1 = Join-Path $outDir $rawPath
        $candidateHtml = Join-Path $outDir ($rawPath + ".html")
        $candidateIndex = Join-Path $outDir (Join-Path $rawPath "index.html")

        if (Test-Path $candidate1 -PathType Leaf) {
            $targetFile = $candidate1
        } elseif (Test-Path $candidateHtml -PathType Leaf) {
            $targetFile = $candidateHtml
        } elseif (Test-Path $candidateIndex -PathType Leaf) {
            $targetFile = $candidateIndex
        } else {
            # Fallback to index.html or 404.html
            $candidate404 = Join-Path $outDir "404.html"
            $candidateDefaultIndex = Join-Path $outDir "index.html"
            if (Test-Path $candidate404 -PathType Leaf) {
                $targetFile = $candidate404
            } elseif (Test-Path $candidateDefaultIndex -PathType Leaf) {
                $targetFile = $candidateDefaultIndex
            }
        }

        if ($targetFile -and (Test-Path $targetFile -PathType Leaf)) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($targetFile)
                $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
                $contentType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".mjs"  { "application/javascript; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".gif"  { "image/gif" }
                    ".svg"  { "image/svg+xml" }
                    ".ico"  { "image/x-icon" }
                    ".webp" { "image/webp" }
                    ".pdf"  { "application/pdf" }
                    ".woff" { "font/woff" }
                    ".woff2" { "font/woff2" }
                    ".ttf"  { "font/ttf" }
                    ".txt"  { "text/plain; charset=utf-8" }
                    Default { "application/octet-stream" }
                }

                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
                $err = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error")
                $response.OutputStream.Write($err, 0, $err.Length)
            }
        } else {
            $response.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($err, 0, $err.Length)
        }

        $response.Close()
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    $listener.Stop()
}
