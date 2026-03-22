@echo off
set PASSWORDS=supplio_secret supplio postgres root password admin 123456
for %%p in (%PASSWORDS%) do (
    echo Testing password: %%p
    set PGPASSWORD=%%p
    psql -U supplio -d supplio_main -h 127.0.0.1 -c "SELECT 1" >nul 2>&1
    if not errorlevel 1 (
        echo SUCCESS: Password is %%p
        goto :found
    )
    psql -U postgres -d supplio_main -h 127.0.0.1 -c "SELECT 1" >nul 2>&1
    if not errorlevel 1 (
        echo SUCCESS: User is postgres, Password is %%p
        goto :found
    )
)
echo NONE OF THE COMMON PASSWORDS WORKED.
exit /b 1

:found
exit /b 0
