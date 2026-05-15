Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY TO EXISTING GITHUB REPO" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$username = "Abigael75"
$repoName = "university-comm-hub"

cd "C:\Users\HomePC\Documents\my websites\03-2026 project root"

# Initialize git if not already
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add all files
Write-Host "Adding files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "University Comm Hub - Complete Project"

# Ensure main branch
git branch -M main

# Remove existing remote if any
git remote remove origin 2>$null

# Add correct remote
git remote add origin "https://github.com/$username/$repoName.git"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "If prompted, log in to GitHub in your browser" -ForegroundColor Cyan
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "✅ DEPLOYED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "View at: https://github.com/$username/$repoName" -ForegroundColor Cyan
} else {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}
