#!/usr/bin/env node
// Sets Float's version everywhere it is declared, and prints the new version.
// Usage: node scripts/bump-version.mjs <patch|minor|major|X.Y.Z>
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const level = process.argv[2];
const current = JSON.parse(readFileSync('package.json', 'utf8')).version;
const [major, minor, patch] = current.split('.').map(Number);

const next =
  level === 'patch' ? `${major}.${minor}.${patch + 1}`
  : level === 'minor' ? `${major}.${minor + 1}.0`
  : level === 'major' ? `${major + 1}.0.0`
  : /^\d+\.\d+\.\d+$/.test(level ?? '') ? level
  : null;

if (!next) {
  console.error(`Usage: bump-version.mjs <patch|minor|major|X.Y.Z> (current: ${current})`);
  process.exit(1);
}

const replaceOnce = (file, pattern, replacement) => {
  const text = readFileSync(file, 'utf8');
  if (!pattern.test(text)) throw new Error(`No version found in ${file}`);
  writeFileSync(file, text.replace(pattern, replacement));
};

// package.json and package-lock.json
execFileSync('npm', ['version', next, '--no-git-tag-version', '--allow-same-version'], { stdio: 'ignore' });
replaceOnce('src-tauri/tauri.conf.json', /"version": "[^"]+"/, `"version": "${next}"`);
// The first `version =` in Cargo.toml is the [package] one.
replaceOnce('src-tauri/Cargo.toml', /^version = "[^"]+"/m, `version = "${next}"`);
execFileSync('cargo', ['update', '-p', 'app', '--offline', '--quiet'], { cwd: 'src-tauri', stdio: 'ignore' });

console.log(next);
