#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const flowiseVersion = JSON.parse(readFileSync(join(projectRoot, 'packages', 'server', 'package.json'), 'utf8')).version
const runtimeKey = `${process.platform}-${process.arch}`
const outputRoot = resolve(process.env.OPENIDEAS_DESKTOP_OUTPUT || join(projectRoot, 'dist', 'desktop-runtime', runtimeKey))
const serverDirectory = join(outputRoot, 'server')
const executableName = process.platform === 'win32' ? 'node.exe' : 'node'
const executable = join(outputRoot, 'bin', executableName)
const pnpmCli = process.env.npm_execpath

function runPnpm(args) {
    if (pnpmCli) {
        execFileSync(process.execPath, [pnpmCli, ...args], { cwd: projectRoot, stdio: 'inherit' })
        return
    }
    execFileSync('pnpm', args, { cwd: projectRoot, stdio: 'inherit' })
}

if (process.env.OPENIDEAS_DESKTOP_SKIP_BUILD !== '1') {
    runPnpm(['build'])
}

rmSync(outputRoot, { recursive: true, force: true })
mkdirSync(join(outputRoot, 'bin'), { recursive: true })

runPnpm(['--filter', './packages/server', '--prod', 'deploy', serverDirectory])

cpSync(process.execPath, executable)
if (process.platform !== 'win32') {
    const { chmodSync } = await import('node:fs')
    chmodSync(executable, 0o755)
}

const entrypoint = join(serverDirectory, 'bin', 'run')
if (!existsSync(entrypoint)) {
    throw new Error(`Desktop runtime is missing Flowise entrypoint: ${entrypoint}`)
}

writeFileSync(
    join(outputRoot, 'manifest.json'),
    JSON.stringify(
        {
            schemaVersion: 1,
            product: 'OpenIdeas',
            flowiseVersion,
            runtimeKey,
            nodeVersion: process.version,
            executable: `bin/${executableName}`,
            entrypoint: 'server/bin/run'
        },
        null,
        2
    ) + '\n'
)

// eslint-disable-next-line no-console
console.log(`[openideas] Desktop runtime ready: ${outputRoot}`)
