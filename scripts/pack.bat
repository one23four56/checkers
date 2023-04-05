@echo off
cd ..
echo Checking typescript...
call npm run --silent check
echo Check passed
call npx sass --style=compressed --no-source-map src/scss/index.scss:out/index.min.css
call npx esbuild src/ts/index.ts --bundle --outfile=out/index.min.js --format=iife --minify --target=es6
xcopy "./src/html/index.html" "./out/index.html" /s /f /y
call node scripts/pack-html.mjs
echo Packing complete, output is at out/index.min.html