import { spawn, spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const children = new Set();

function run(name, command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: false,
    windowsHide: true
  });

  children.add(child);
  child.on('exit', (code, signal) => {
    children.delete(child);
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}.`);
      shutdown(code);
    }
    if (signal) {
      console.error(`${name} exited from signal ${signal}.`);
      shutdown(1);
    }
  });

  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (child.killed) continue;
    if (isWindows) {
      spawnSync('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

const viteArgs = process.argv.slice(2);

run('chat proxy', 'node', ['server/deepseek-proxy.mjs']);
if (isWindows) {
  run('vite', 'cmd.exe', ['/d', '/c', 'npx', 'vite', ...viteArgs]);
} else {
  run('vite', 'npx', ['vite', ...viteArgs]);
}
