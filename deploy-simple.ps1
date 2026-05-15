Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY TO GITHUB" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$username = "Abigael75"
$repoName = "university-comm-hub"

cd "C:\Users\HomePC\Documents\my websites\03-2026 project root"

# Initialize git if not already
if (-not (Test-Path ".git")) {
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

# Remove existing remote
git remote remove origin 2>$null

# Add remote
git remote add origin "https://github.com/$username/$repoName.git"

# Push to GitHub
Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
Write-Host "Username: $username" -ForegroundColor Cyan
Write-Host "Password: Use your Personal Access Token (NOT your GitHub password)" -ForegroundColor Cyan
Write-Host ""

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
