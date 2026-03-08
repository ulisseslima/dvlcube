#!/usr/bin/env node

/**
 * DVLCube Remote Control — Copilot CLI Polling Agent
 *
 * Polls the DVLCube remote control server for pending commands and
 * executes them via `copilot -p` (GitHub Copilot CLI).
 *
 * Usage:
 *   node remote-agent.js <session-id> [options]
 *
 * Options:
 *   --url <base-url>       DVLCube server URL (default: http://localhost:5000)
 *   --interval <seconds>   Polling interval in seconds (default: 3)
 *   --model <model>        Default model to use (overridden by per-command model)
 *   --yolo                 Pass --yolo to copilot (allow all tool permissions)
 *   --copilot-session <id> Resume a specific Copilot CLI session
 *   --continue             Resume the most recently closed local session
 *   --cwd <path>           Working directory for copilot commands
 *   --dry-run              Print commands instead of executing them
 *
 * Examples:
 *   node remote-agent.js a3f1b2c4
 *   node remote-agent.js a3f1b2c4 --url https://www.dvlcube.com --yolo
 *   node remote-agent.js a3f1b2c4 --model gpt-4o --copilot-session abc123
 */

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const os = require('os')

// ─── Argument Parsing ────────────────────────────────────────────────────────

function parseArgs(argv) {
    const args = argv.slice(2)
    const opts = {
        sessionId: null,
        url: process.env.REMOTE_CONTROL_URL || 'http://localhost:5000',
        interval: 3,
        model: 'gpt-5-mini',
        yolo: true,
        copilotSession: null,
        continue: true,
        cwd: process.cwd(),
        dryRun: false,
        detectSession: true,
        detectModel: 'gpt-5-mini'
    }

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--url':       opts.url = args[++i]; break
            case '--interval':  opts.interval = parseInt(args[++i], 10); break
            case '--model':     opts.model = args[++i]; break
            case '--yolo':      opts.yolo = true; break
            case '--copilot-session': opts.copilotSession = args[++i]; break
            case '--continue':  opts.continue = true; break
            case '--cwd':       opts.cwd = args[++i]; break
            case '--dry-run':   opts.dryRun = true; break
            case '--detect-session': opts.detectSession = true; break
            case '--detect-model':   opts.detectModel = args[++i]; break
            case '--help': case '-h':
                console.log(USAGE)
                process.exit(0)
            default:
                if (!args[i].startsWith('-') && !opts.sessionId) {
                    opts.sessionId = args[i]
                } else {
                    console.error(`Unknown option: ${args[i]}`)
                    process.exit(1)
                }
        }
    }

    if (!opts.sessionId) {
        console.error('Error: session-id is required\n')
        console.log(USAGE)
        process.exit(1)
    }

    return opts
}

const USAGE = `
Usage: node remote-agent.js <session-id> [options]

Options:
  --url <base-url>           Server URL (default: http://localhost:5000 or $REMOTE_CONTROL_URL)
  --interval <seconds>       Polling interval (default: 3)
  --model <model>            Default Copilot model
  --yolo                     Allow all tool permissions (--yolo flag)
  --copilot-session <id>     Resume a specific Copilot CLI session
  --continue                 Resume the most recently closed local session
  --cwd <path>               Working directory for copilot (default: current dir)
  --dry-run                  Print commands without executing
  --detect-session           Auto-detect Copilot session ID on startup
  --detect-model <model>     Model for session detection (default: gpt-4.1-nano)
  -h, --help                 Show this help
`.trim()

// ─── API Client ──────────────────────────────────────────────────────────────

class RemoteControlClient {
    constructor(baseUrl, sessionId) {
        this.agentUrl = `${baseUrl.replace(/\/$/, '')}/remote/api/agent/${sessionId}`
        this.sessionUrl = `${baseUrl.replace(/\/$/, '')}/remote/api/session/${sessionId}`
    }

    async poll() {
        const res = await fetch(`${this.agentUrl}/poll`)
        if (!res.ok) throw new Error(`Poll failed: ${res.status} ${res.statusText}`)
        return res.json()
    }

    async ack(commandId) {
        const res = await fetch(`${this.agentUrl}/ack/${commandId}`, { method: 'POST' })
        if (!res.ok) throw new Error(`Ack failed: ${res.status}`)
        return res.json()
    }

    async respond(commandId, output, status = 'completed') {
        const res = await fetch(`${this.agentUrl}/respond/${commandId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ output, status })
        })
        if (!res.ok) throw new Error(`Respond failed: ${res.status}`)
        return res.json()
    }

    async sendMeta(meta) {
        const res = await fetch(`${this.agentUrl}/meta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(meta)
        })
        if (!res.ok) throw new Error(`Meta failed: ${res.status}`)
        return res.json()
    }
}

// ─── Copilot Session Detection ───────────────────────────────────────────────

/**
 * Try to find the most recent Copilot CLI session ID by scanning
 * the ~/.copilot/sessions/ directory for the newest session file.
 */
function detectSessionFromFilesystem() {
    const copilotDir = path.join(os.homedir(), '.copilot', 'sessions')
    try {
        if (!fs.existsSync(copilotDir)) return null
        const entries = fs.readdirSync(copilotDir)
            .map(name => {
                const fullPath = path.join(copilotDir, name)
                try {
                    const stat = fs.statSync(fullPath)
                    return { name, mtime: stat.mtimeMs }
                } catch { return null }
            })
            .filter(Boolean)
            .sort((a, b) => b.mtime - a.mtime)

        if (entries.length === 0) return null

        // The session dir/file name is typically the session ID
        const newest = entries[0].name.replace(/\.json$/, '')
        return newest || null
    } catch {
        return null
    }
}

/**
 * Run a cheap copilot prompt to obtain the session ID.
 * Asks the model to respond with only the session ID.
 */
async function detectSessionViaPrompt(opts) {
    const model = opts.detectModel
    const args = ['--model', model, '-p',
        'What is your current session ID? Respond with ONLY the session ID string and absolutely nothing else. No explanation, no extra text.'
    ]
    if (opts.yolo) args.splice(0, 0, '--yolo')

    console.log(`   🔍 Detecting session via: copilot ${args.join(' ')}`)
    const result = await executeCopilot(args, opts.cwd)

    if (result.exitCode !== 0) {
        console.log(`   ⚠ Session detection failed (exit code ${result.exitCode})`)
        return null
    }

    // Try to extract something that looks like a session ID from the output
    const output = result.output.trim()
    // Look for a hex/uuid-like string
    const match = output.match(/\b([a-f0-9-]{8,})\b/i)
    if (match) {
        return match[1]
    }
    // If the output is short enough, it might be the session ID itself
    if (output.length > 0 && output.length < 100 && !output.includes(' ')) {
        return output
    }
    return output || null
}

// ─── Copilot CLI Execution ───────────────────────────────────────────────────

/**
 * Build the copilot CLI argument array for a command.
 */
function buildCopilotArgs(cmd, opts) {
    const args = []

    // Model: per-command model takes priority, then default, then omit
    const model = cmd.model || opts.model
    if (model) {
        args.push('--model', model)
    }

    // YOLO: per-command flag or global flag
    if (cmd.yolo || opts.yolo) {
        args.push('--yolo')
    }

    // Session resume: per-command copilotSession, or global copilotSession, or --continue
    const copilotSession = cmd.copilotSession || opts.copilotSession
    if (copilotSession) {
        args.push('--resume', copilotSession)
    } else if (opts.continue) {
        args.push('--continue')
    }

    // The prompt itself
    args.push('-p', cmd.prompt)

    return args
}

/**
 * Execute a copilot command and capture its output.
 * Returns { output, exitCode }
 */
function executeCopilot(args, cwd) {
    return new Promise((resolve) => {
        const proc = spawn('copilot', args, {
            cwd,
            env: { ...process.env },
            stdio: ['ignore', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
            const chunk = data.toString()
            stdout += chunk
            process.stdout.write(chunk)
        })

        proc.stderr.on('data', (data) => {
            const chunk = data.toString()
            stderr += chunk
            process.stderr.write(chunk)
        })

        proc.on('close', (code) => {
            const output = stdout + (stderr ? `\n--- stderr ---\n${stderr}` : '')
            resolve({ output: output.trim(), exitCode: code })
        })

        proc.on('error', (err) => {
            resolve({ output: `Failed to start copilot: ${err.message}`, exitCode: 1 })
        })
    })
}

/**
 * Execute a raw terminal command.
 * Returns { output, exitCode }
 */
function executeTerminal(command, cwd) {
    return new Promise((resolve) => {
        const proc = spawn('bash', ['-c', command], {
            cwd,
            env: { ...process.env },
            stdio: ['ignore', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
            const chunk = data.toString()
            stdout += chunk
            process.stdout.write(chunk)
        })

        proc.stderr.on('data', (data) => {
            const chunk = data.toString()
            stderr += chunk
            process.stderr.write(chunk)
        })

        proc.on('close', (code) => {
            const output = stdout + (stderr ? `\n--- stderr ---\n${stderr}` : '')
            resolve({ output: output.trim(), exitCode: code })
        })

        proc.on('error', (err) => {
            resolve({ output: `Failed to execute: ${err.message}`, exitCode: 1 })
        })
    })
}

// ─── Main Loop ───────────────────────────────────────────────────────────────

let processing = false

async function pollAndExecute(client, opts) {
    if (processing) return // prevent overlap
    processing = true

    try {
        const { pending } = await client.poll()

        for (const cmd of pending) {
            const timestamp = new Date().toLocaleTimeString()
            console.log(`\n${'━'.repeat(60)}`)
            console.log(`[${timestamp}] 📥 ${cmd.type}: ${cmd.prompt.substring(0, 100)}${cmd.prompt.length > 100 ? '...' : ''}`)
            if (cmd.model) console.log(`   Model: ${cmd.model}`)
            if (cmd.yolo) console.log(`   YOLO: enabled`)
            if (cmd.copilotSession) console.log(`   Copilot session: ${cmd.copilotSession}`)
            console.log('━'.repeat(60))

            // Acknowledge
            await client.ack(cmd.id)
            console.log(`   ✓ Acknowledged (${cmd.id})`)

            let output, status

            if (opts.dryRun) {
                // Dry run: just show what would be executed
                if (cmd.type === 'terminal') {
                    console.log(`   [DRY RUN] bash -c "${cmd.prompt}"`)
                } else {
                    const args = buildCopilotArgs(cmd, opts)
                    console.log(`   [DRY RUN] copilot ${args.join(' ')}`)
                }
                output = '[dry-run] Command not executed'
                status = 'completed'
            } else if (cmd.type === 'terminal') {
                // Raw terminal command
                console.log(`   ▶ bash -c "${cmd.prompt}"`)
                const result = await executeTerminal(cmd.prompt, opts.cwd)
                output = result.output
                status = result.exitCode === 0 ? 'completed' : 'failed'
            } else {
                // Copilot prompt (type: prompt, file, or any other)
                const args = buildCopilotArgs(cmd, opts)
                console.log(`   ▶ copilot ${args.join(' ')}`)
                const result = await executeCopilot(args, opts.cwd)
                output = result.output
                status = result.exitCode === 0 ? 'completed' : 'failed'
            }

            // Send response back
            await client.respond(cmd.id, output, status)
            const icon = status === 'completed' ? '✅' : '❌'
            console.log(`   ${icon} ${status} (${output.length} chars)`)

            // After a copilot command, try to detect session ID if not yet known
            if (cmd.type !== 'terminal' && !opts.copilotSession) {
                const fsSession = detectSessionFromFilesystem()
                if (fsSession) {
                    opts.copilotSession = fsSession
                    console.log(`   📂 Detected copilot session: ${fsSession}`)
                    try {
                        await client.sendMeta({ copilotSessionId: fsSession })
                    } catch (_) { /* best effort */ }
                }
            }
        }
    } catch (err) {
        // Only log once per error type to avoid flooding
        if (err.cause?.code === 'ECONNREFUSED') {
            console.error(`   ⚠ Server unreachable — retrying...`)
        } else if (err.message?.includes('Poll failed: 404')) {
            console.error(`   ⚠ Session not found — it may have expired`)
        } else {
            console.error(`   ⚠ Poll error: ${err.message}`)
        }
    } finally {
        processing = false
    }
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

async function main() {
    const opts = parseArgs(process.argv)
    const client = new RemoteControlClient(opts.url, opts.sessionId)

    console.log(`
╔════════════════════════════════════════════════════════════╗
║           🎮  DVLCube Remote Control Agent                ║
╠════════════════════════════════════════════════════════════╣
║  Session:    ${opts.sessionId.padEnd(43)} ║
║  Server:     ${opts.url.padEnd(43)} ║
║  Interval:   ${(opts.interval + 's').padEnd(43)} ║
║  Model:      ${(opts.model || '(per-command / default)').padEnd(43)} ║
║  YOLO:       ${(opts.yolo ? 'YES ⚡' : 'no').padEnd(43)} ║
║  CWD:        ${opts.cwd.substring(0, 43).padEnd(43)} ║${opts.dryRun ? `
║  DRY RUN:    ${'YES (no commands will execute)'.padEnd(43)} ║` : ''}
╚════════════════════════════════════════════════════════════╝
    `.trim())

    if (opts.copilotSession) {
        console.log(`   Copilot session: ${opts.copilotSession} (will resume)`)
    }
    if (opts.continue) {
        console.log(`   Will resume most recent Copilot session (--continue)`)
    }
    console.log(`\nPolling for commands... (Ctrl+C to stop)\n`)

    // Notify server that agent is connected
    try {
        await client.sendMeta({ agentConnected: true })
    } catch (err) {
        console.error(`   ⚠ Could not notify server: ${err.message}`)
    }

    // Detect Copilot session ID
    let detectedCopilotSession = opts.copilotSession || null

    if (!detectedCopilotSession) {
        // First: try filesystem detection (fast, no API call)
        const fsSession = detectSessionFromFilesystem()
        if (fsSession) {
            console.log(`   📂 Detected session from filesystem: ${fsSession}`)
            detectedCopilotSession = fsSession
        }
    }

    if (!detectedCopilotSession && opts.detectSession) {
        // Fallback: ask copilot for its session ID using a cheap model
        console.log(`   🔍 Running session detection prompt...`)
        const promptSession = await detectSessionViaPrompt(opts)
        if (promptSession) {
            console.log(`   🤖 Detected session via prompt: ${promptSession}`)
            detectedCopilotSession = promptSession
        } else {
            console.log(`   ⚠ Could not detect session ID via prompt`)
        }
    }

    if (detectedCopilotSession) {
        // Report to server so web UI can display it
        try {
            await client.sendMeta({ copilotSessionId: detectedCopilotSession })
            console.log(`   ✅ Copilot session ID reported to server: ${detectedCopilotSession}`)
        } catch (err) {
            console.error(`   ⚠ Could not report session ID: ${err.message}`)
        }

        // Also set it as the default for future commands if not already set
        if (!opts.copilotSession) {
            opts.copilotSession = detectedCopilotSession
        }
    }

    console.log('')

    // Initial poll
    await pollAndExecute(client, opts)

    // Recurring poll
    const timer = setInterval(() => pollAndExecute(client, opts), opts.interval * 1000)

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n\n👋 Agent stopped.')
        clearInterval(timer)
        process.exit(0)
    })
}

main()
