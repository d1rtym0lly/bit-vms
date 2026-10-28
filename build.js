// Собирает index.html — один самодостаточный файл: работает на GitHub Pages и без интернета
// (шрифты и скрипты встраиваются из папки src). Запуск: node build.js
const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');

let page = src('index.html');
page = page.replace(/<link rel="preconnect"[^>]*>\s*/g, '')
           .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, () => `<style>\n${src('fonts.css')}</style>`)
           .replace(/<script src="([\w.-]+\.js)"><\/script>/g, (_, f) => {
             const code = src(f);
             if (code.includes('</script')) throw new Error(f + ' содержит </script>');
             return `<script>\n${code}\n</script>`;
           });
const cut = page.indexOf('<header class="top">');
if (cut < 0) throw new Error('в src/index.html не найден <header class="top">');
const html = `<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>body{margin:0}</style>\n${page.slice(0, cut)}</head>\n<body>\n${page.slice(cut)}\n</body>\n</html>\n`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html: ' + Math.round(Buffer.byteLength(html) / 1024) + ' КБ');
