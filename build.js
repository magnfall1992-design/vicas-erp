// Construit app.html (artifact claude.ai) et index.html (GitHub Pages) à partir de src/
const fs=require("fs");
const css=fs.readFileSync("src/style.css","utf8"), seed=fs.readFileSync("src/seed.js","utf8"), app=fs.readFileSync("src/app.js","utf8");
const fonts='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:wght@400;600;700&display=swap">';
const body=`<div id="app"></div>\n<script>\n${seed}\n</script>\n<script>\n${app}\n</script>`;
fs.writeFileSync("app.html",`<title>VICAS ERP</title>\n${fonts}\n<style>\n${css}\n</style>\n${body}\n`);
const icon='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#ee7130"/><text x="32" y="43" font-family="Arial" font-weight="900" font-style="italic" font-size="30" fill="#2b4ec5" text-anchor="middle">V</text></svg>');
fs.writeFileSync("index.html",`<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#16245a"><title>VICAS ERP</title><link rel="icon" href="${icon}">\n${fonts}\n<style>\n:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}img{max-width:100%}\n${css}\n</style></head><body>\n${body}\n</body></html>\n`);
console.log("ok", fs.statSync("app.html").size, fs.statSync("index.html").size);
