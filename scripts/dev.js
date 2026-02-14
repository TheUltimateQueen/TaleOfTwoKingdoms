const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const WATCH_ROOTS = ['server.js', 'src', 'public'];
const EXTENSIONS = new Set(['.js', '.html', '.css']);
const POLL_MS = 700;

let child = null;
let signature = '';
let restarting = false;

function collectFiles(entryPath, out) {
  if (!fs.existsSync(entryPath)) return;
  const stat = fs.statSync(entryPath);
  if (stat.isFile()) {
    if (EXTENSIONS.has(path.extname(entryPath))) out.push(entryPath);
    return;
  }

  const items = fs.readdirSync(entryPath, { withFileTypes: true });
  for (const item of items) {
    if (item.name === '.git' || item.name === 'node_modules') continue;
    collectFiles(path.join(entryPath, item.name), out);
  }
}

function computeSignature() {
  const files = [];
  for (const root of WATCH_ROOTS) collectFiles(path.join(ROOT, root), files);
  files.sort();

  const parts = [];
  for (const file of files) {
    try {
      const st = fs.statSync(file);
      parts.push(`${file}:${st.mtimeMs}:${st.size}`);
    } catch {
      // ignore race during save
    }
  }
  return parts.join('|');
}

function startServer() {
  child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, sig) => {
    if (restarting) return;
    if (sig) process.kill(process.pid, sig);
    else process.exit(code || 0);
  });
}

function restartServer() {
  if (!child) return startServer();
  restarting = true;
  const old = child;
  old.removeAllListeners('exit');
  old.once('exit', () => {
    restarting = false;
    startServer();
  });
  old.kill('SIGTERM');
}

function tick() {
  try {
    const next = computeSignature();
    if (!signature) signature = next;
    else if (next !== signature) {
      signature = next;
      console.log('\n[dev] change detected, restarting server...');
      restartServer();
    }
  } catch (err) {
    console.error('[dev] watch error:', err.message);
  }
}

function shutdown() {
  if (child) child.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

signature = computeSignature();
startServer();
setInterval(tick, POLL_MS);
