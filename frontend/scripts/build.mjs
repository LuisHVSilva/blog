import {spawnSync} from 'node:child_process';

const distDir = process.env.FRONTEND_BUILD_OUT_DIR ?? 'dist';
const ssrDir = process.env.FRONTEND_SSR_OUT_DIR ?? '.ssr';

function run(command, args) {
    const result = spawnSync(command, args, {stdio: 'inherit', shell: process.platform === 'win32'});
    if (result.status !== 0) process.exit(result.status ?? 1);
}

run('tsc', ['-b']);
run('vite', ['build', '--outDir', distDir]);
run('vite', ['build', '--ssr', 'src/entry-server.tsx', '--outDir', ssrDir]);
run('node', ['scripts/prerender.mjs']);
