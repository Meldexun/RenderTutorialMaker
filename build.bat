xcopy .\src\ .\build\ /e /y
for /r .\build\ %%f in (*.js) do browserify %%f -o %%f