/**
 * Packs css+js into index.html, minifies it, and writes it to index.min.html
 */

import * as fs from 'fs';
import { minify } from 'html-minifier';

let
    html = fs.readFileSync("out/index.html", "utf-8"),
    js =   fs.readFileSync("out/index.min.js", "utf-8"),
    css =  fs.readFileSync("out/index.min.css", "utf-8");

html = html.replace(
    `<script src="index.js"></script>`, 
    `<script>${js}</script>`
);

html = html.replace(
    `<link rel="stylesheet" href="index.css">`,
    `<style>${css}</style>`
);

fs.writeFileSync("out/index.min.html", minify(html, {
    minifyCSS: true, 
    minifyJS: true,
}), "utf-8");

process.exit(0);