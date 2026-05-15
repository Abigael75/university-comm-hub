$users = @(
    @{
        name = "Alice Wangari"
        email = "alice@kabianga.ac.ke"
        password = "alice123"
        confirmPassword = "alice123"
        role = "student"
        studentId = "COM/2024/001"
        department = "Computer Science"
    },
    @{
        name = "Bob Ochieng"
        email = "bob@kabianga.ac.ke"
        password = "bob123"
        confirmPassword = "bob123"
        role = "student"
        studentId = "COM/2024/003"
        department = "Information Technology"
    },
    @{
        name = "Dr. Sarah Kimani"
        email = "sarah@kabianga.ac.ke"
        password = "sarah123"
        confirmPassword = "sarah123"
        role = "lecturer"
        staffId = "STAFF/002"
        department = "Computer Science"
    },
    @{
        name = "James Mwangi"
        email = "james@kabianga.ac.ke"
        password = "james123"
        confirmPassword = "james123"
        role = "student"
        studentId = "COM/2024/004"
        department = "Engineering"
    },
    @{
        name = "Dr. Peter Odhiambo"
        email = "peter@kabianga.ac.ke"
        password = "peter123"
        confirmPassword = "peter123"
        role = "lecturer"
        staffId = "STAFF/003"
        department = "Engineering"
    }
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BULK USER REGISTRATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$successCount = 0
$failCount = 0

foreach ($user in $users) {
    try {
        $body = $user | ConvertTo-Json
        $response = Invoke-RestMethod -Uri http://localhost:3001/api/auth/register -Method Post -Body $body -ContentType "application/json" -ErrorVariable RestError
        
        if ($response.success) {
            Write-Host "✅ Registered: $($user.name) - $($user.email)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ Failed: $($user.name) - $($response.message)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        $errorMsg = $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
            $errorMsg = $errorDetail.message
        }
        Write-Host "❌ Failed: $($user.name) - $errorMsg" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Registration Complete!" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
