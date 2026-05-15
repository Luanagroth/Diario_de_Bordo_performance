const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const files = [
  { src: 'estilo.css', dest: 'estilo.min.css', minify: minifyCss },
  { src: 'script.js', dest: 'script.min.js', minify: minifyJs }
];

files.forEach(({ src, dest, minify }) => {
  const sourcePath = path.join(projectRoot, src);
  const outputPath = path.join(projectRoot, dest);
  const source = fs.readFileSync(sourcePath, 'utf8');
  const minified = minify(source);
  fs.writeFileSync(outputPath, minified, 'utf8');
  console.log(`Generated ${dest}`);
});

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function minifyJs(js) {
  const withoutComments = js
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');

  return withoutComments
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();=,:<>+\-\*\/\?&|!~%\[\]])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}
