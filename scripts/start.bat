@echo off
cd ..
echo Checking typescript...
call npm run --silent check
echo Check passed
start npx sass --watch src/scss/index.scss:out/index.css
start npx esbuild src/ts/index.ts --bundle --outfile=out/index.js --format=esm --sourcemap --watch
xcopy "./src/html/index.html" "./out/index.html" /s /f /y
start out/index.html