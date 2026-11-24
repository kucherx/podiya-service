import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nunjucks from 'nunjucks';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsRoots = ['src', 'scripts', 'api'];
const viewDir = path.join(root, 'src', 'view');

function walk(dir, extension, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, extension, out);
    else if (full.endsWith(extension)) out.push(full);
  }
  return out;
}

let failed = 0;

const jsFiles = jsRoots.flatMap((dir) => walk(path.join(root, dir), '.js'));
for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (error) {
    failed += 1;
    console.error(`JS  ${path.relative(root, file)}`);
    console.error(String(error.stderr || error.message).trim());
  }
}

const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(viewDir, { noCache: true }),
  { autoescape: true }
);

const templates = walk(viewDir, '.njk');
for (const file of templates) {
  try {
    nunjucks.compile(
      readFileSync(file, 'utf8'),
      env,
      path.relative(viewDir, file).replace(/\\/g, '/'),
      true
    );
  } catch (error) {
    failed += 1;
    console.error(`NJK ${path.relative(root, file)}`);
    console.error(error.message);
  }
}

console.log(`Перевірено JS: ${jsFiles.length}, Nunjucks: ${templates.length}`);
if (failed) {
  console.error(`Помилок: ${failed}`);
  process.exit(1);
}
console.log('Build check: OK');
