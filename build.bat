@echo off

if exist .\build\ rmdir .\build\ /s /q

xcopy .\src\ .\build\ /e /y

for /r .\build\ %%f in (*.js) do (
	echo %%f | findstr .*\\tutorials\\.*\\.* > nul
	if errorlevel 1 browserify %%f -o %%f
)
