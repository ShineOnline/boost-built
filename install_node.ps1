# install_node.ps1
# Self-contained local Node.js downloader and package installer

$ProgressPreference = 'SilentlyContinue'

$url = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip"
$zipFile = Join-Path $PSScriptRoot "node_temp.zip"
$extractFolder = Join-Path $PSScriptRoot "node_portable"

Write-Host "Downloading portable Node.js v20.11.0 (approx. 30MB)..." -ForegroundColor Yellow

# Download node zip using curl (fast and robust on Windows)
if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
    curl.exe -L -o $zipFile $url
} else {
    Invoke-WebRequest -Uri $url -OutFile $zipFile
}

if (Test-Path $zipFile) {
    Write-Host "Extracting Node.js..." -ForegroundColor Yellow
    
    # Extract zip
    Expand-Archive -Path $zipFile -DestinationPath $extractFolder -Force
    
    # Locate npm.cmd and node.exe
    $nodeDir = Get-ChildItem -Path $extractFolder -Directory | Select-Object -First 1
    if ($nodeDir) {
        $nodePath = Join-Path $nodeDir.FullName "node.exe"
        $npmPath = Join-Path $nodeDir.FullName "npm.cmd"
        
        Write-Host "Node.js extracted successfully to $($nodeDir.FullName)" -ForegroundColor Green
        
        # Install packages using local npm
        Write-Host "Installing dependencies (express, multer, dotenv, express-session)..." -ForegroundColor Yellow
        Start-Process -FilePath $npmPath -ArgumentList "install" -WorkingDirectory $PSScriptRoot -NoNewWindow -Wait
        
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
        Write-Host "To start the CRM server, run: .\start_server.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "Error: Could not find extracted Node directory." -ForegroundColor Red
    }
    
    # Clean up zip
    Remove-Item $zipFile -Force
} else {
    Write-Host "Error: Failed to download Node.js zip." -ForegroundColor Red
}
