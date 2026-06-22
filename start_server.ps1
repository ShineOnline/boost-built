# start_server.ps1
# Helper script to launch the local Node.js server

$nodeDir = Get-ChildItem -Path (Join-Path $PSScriptRoot "node_portable") -Directory | Select-Object -First 1
if ($nodeDir) {
    $nodePath = Join-Path $nodeDir.FullName "node.exe"
    Write-Host "Starting Boost Built CRM Server..." -ForegroundColor Green
    Write-Host "Access Admin Dashboard at: http://localhost:3000/admin" -ForegroundColor Cyan
    Write-Host "Default Login details: User: admin | Pass: boostbuilt2026!" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C inside the terminal to stop the server." -ForegroundColor Gray
    
    # Run server synchronously to show output log directly
    & $nodePath "server.js"
} else {
    Write-Host "Error: Local Node.js not found. Please run .\install_node.ps1 first." -ForegroundColor Red
}
