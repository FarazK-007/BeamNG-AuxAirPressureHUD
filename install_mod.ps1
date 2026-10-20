# Packaging & Installation script for Auxiliary Air Pressure HUD Mod
$ErrorActionPreference = "Stop"

$workspaceDir = "d:\Antigravity\BeamNG mod"
$outputZip = Join-Path $workspaceDir "AuxAirPressureHUD.zip"
$userModsDir = "C:\Users\gofar\AppData\Local\BeamNG\BeamNG.drive\current\mods"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Packaging Auxiliary Air Pressure HUD Mod    " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
    Write-Host "[+] Removed previous $outputZip" -ForegroundColor Yellow
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$itemsToInclude = @("lua", "ui", "mod_info.json")

$zipArchive = [System.IO.Compression.ZipFile]::Open($outputZip, [System.IO.Compression.ZipArchiveMode]::Create)

foreach ($item in $itemsToInclude) {
    $fullPath = Join-Path $workspaceDir $item
    if (Test-Path $fullPath) {
        $itemObj = Get-Item $fullPath
        if ($itemObj.PSIsContainer) {
            $files = Get-ChildItem -Path $fullPath -Recurse -File
            foreach ($file in $files) {
                # Format entry name with forward slashes for cross-platform zip compatibility
                $relativePath = $file.FullName.Substring($workspaceDir.Length + 1).Replace('\', '/')
                Write-Host "  Adding: $relativePath" -ForegroundColor Gray
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $file.FullName, $relativePath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        } else {
            $relativePath = (Split-Path $fullPath -Leaf).Replace('\', '/')
            Write-Host "  Adding: $relativePath" -ForegroundColor Gray
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zipArchive, $fullPath, $relativePath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }
}

$zipArchive.Dispose()
Write-Host "[OK] Successfully created: $outputZip" -ForegroundColor Green

if (Test-Path $userModsDir) {
    $destination = Join-Path $userModsDir "AuxAirPressureHUD.zip"
    Copy-Item -Path $outputZip -Destination $destination -Force
    Write-Host "[OK] Mod installed directly into BeamNG mods folder:" -ForegroundColor Green
    Write-Host "     $destination" -ForegroundColor White
} else {
    Write-Host "[!] User mods directory not found at $userModsDir" -ForegroundColor Yellow
    Write-Host "    You can copy $outputZip manually to your BeamNG mods folder." -ForegroundColor Yellow
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Installation Complete!                      " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
