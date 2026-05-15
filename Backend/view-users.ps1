$response = Invoke-RestMethod -Uri http://localhost:3001/api/admin/users -Method Get
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   REGISTERED USERS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($user in $response.users) {
    Write-Host "ID: $($user.id)" -ForegroundColor Yellow
    Write-Host "  Name: $($user.name)" -ForegroundColor White
    Write-Host "  Email: $($user.email)" -ForegroundColor White
    Write-Host "  Role: $($user.role)" -ForegroundColor Green
    if ($user.studentId) { Write-Host "  Student ID: $($user.studentId)" -ForegroundColor Gray }
    if ($user.staffId) { Write-Host "  Staff ID: $($user.staffId)" -ForegroundColor Gray }
    Write-Host "  Created: $($user.createdAt)" -ForegroundColor Gray
    Write-Host "----------------------------------------"
}
