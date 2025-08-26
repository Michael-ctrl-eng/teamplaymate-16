@echo off
echo Pushing code to GitHub...
echo.

cd /d "c:\Users\JOE\Downloads\mm"

echo Setting user config...
"C:\Program Files\Git\bin\git.exe" config --global user.name "Statsor Developer"
"C:\Program Files\Git\bin\git.exe" config --global user.email "developer@statsor.com"

echo Adding all files...
"C:\Program Files\Git\bin\git.exe" add .

echo Committing changes...
"C:\Program Files\Git\bin\git.exe" commit -m "Initial commit: Statsor football management platform with fixed API integrations"

echo Pushing to GitHub...
"C:\Program Files\Git\bin\git.exe" push -u origin master

echo.
echo Done!
pause