#!/usr/bin/env powershell

param(
    [switch]$Start,
    [switch]$Stop
)

if ($Start) {
    Write-Host "Iniciando servidor Backend..." -ForegroundColor Cyan
    Start-Process -FilePath "node" -ArgumentList "simple.js" -WorkingDirectory "c:\Users\luisr\OneDrive\Desktop\Proyecto Angular\Backend" -NoNewWindow
    Start-Sleep -Seconds 3
    Write-Host "✅ Servidor iniciado en puerto 4000" -ForegroundColor Green
}

if ($Stop) {
    Write-Host "Deteniendo procesos node..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Procesos detenidos" -ForegroundColor Green
}
