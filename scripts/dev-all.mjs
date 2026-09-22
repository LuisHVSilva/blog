import {spawn} from 'node:child_process';

const siteUrl = 'http://localhost:8080/pt-BR';
const healthUrl = 'http://localhost:8080/health/ready';

function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {stdio: 'inherit', shell: process.platform === 'win32'});
        child.once('error', reject);
        child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with status ${code ?? 'unknown'}.`)));
    });
}

async function waitForLocalStack() {
    const deadline = Date.now() + 15_000;
    let lastError;
    while (Date.now() < deadline) {
        try {
            const [site, health] = await Promise.all([
                fetch(siteUrl, {redirect: 'manual', signal: AbortSignal.timeout(2_000)}),
                fetch(healthUrl, {signal: AbortSignal.timeout(2_000)})
            ]);
            if (site.ok && health.ok) return;
            lastError = new Error(`Site returned ${site.status}; health returned ${health.status}.`);
        } catch (error) {
            lastError = error;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`The local stack did not become ready: ${lastError instanceof Error ? lastError.message : 'unknown error'}.`);
}

try {
    await run('docker', ['compose', 'up', '--build', '--force-recreate', '--wait', '--detach']);
    await waitForLocalStack();
    console.log(`\nFrontend: ${siteUrl}`);
    console.log(`API:      http://localhost:8080/api/v1/articles?locale=pt-BR&limit=20`);
    console.log(`Health:   ${healthUrl}`);
} catch (error) {
    console.error(`\nCould not start the local production simulation: ${error instanceof Error ? error.message : 'unknown error'}`);
    process.exitCode = 1;
}
