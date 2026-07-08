#!/usr/bin/env node

const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

const serverEntry = join(process.cwd(), 'dist', 'server.js');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }
}

if (!existsSync(serverEntry)) {
  console.log('Production build not found at dist/server.js; running npm run build first.');
  run('npm', ['run', 'build']);
}

run(process.execPath, [serverEntry]);
