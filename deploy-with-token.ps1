Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY TO GITHUB (WITH TOKEN)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Before continuing, make sure you have:" -ForegroundColor Yellow
Write-Host "1. Created a Personal Access Token at https://github.com/settings/tokens" -ForegroundColor White
Write-Host "2. Token has 'repo' scope checked" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Do you have your token ready? (y/n)"
if ($continue -ne 'y') {
    Write-Host "Please create a token first at: https://github.com/settings/tokens" -ForegroundColor Red
    exit
}

$username = "Abigael75"
$repoName = "university-comm-hub"

cd "C:\Users\HomePC\Documents\my websites\03-2026 project root"

# Add all files
Write-Host "`nAdding files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "University Comm Hub - Complete Project"

# Ensure main branch
git branch -M main

# Remove existing remote
git remote remove origin 2>$null

# Add remote with username (token will be used for auth)
git remote add origin "https://github.com/$username/$repoName.git"

# Push to GitHub
Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
Write-Host "When prompted for username: $username" -ForegroundColor Cyan
Write-Host "When prompted for password: PASTE YOUR PERSONAL ACCESS TOKEN" -ForegroundColor Cyan
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
