import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const hash = createHash('sha256');
function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name))) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) visit(file); else { hash.update(file); hash.update(readFileSync(file)); }
  }
}
visit('src'); visit('prisma');
for (const file of ['package.json', 'package-lock.json', 'tsconfig.json', 'scripts/build-info.mjs', 'scripts/clean-build.mjs', 'render.yaml']) { hash.update(file); hash.update(readFileSync(file)); }
let commit = process.env.RENDER_GIT_COMMIT || 'unknown';
try { if (commit === 'unknown') commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch {}
writeFileSync('dist/build-info.json', JSON.stringify({ commit, sourceSha256: hash.digest('hex'), builtAt: new Date().toISOString() }) + '\n');
