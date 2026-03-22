@echo off
set PASSWORDS=postgres root admin 123456 password supplio supplio_secret
for %%p in (%PASSWORDS%) do (
    echo Testing postgres:%%p
    set PGPASSWORD=%%p
    psql -U postgres -d postgres -h 127.0.0.1 -c "SELECT 1" >nul 2>&1
    if not errorlevel 1 (
        echo SUCCESS: User is postgres, Password is %%p
        goto :found
    )
)
echo NONE WORKED.
exit /b 1

:found
echo FOUND: postgres:%%p
exit /b 0
