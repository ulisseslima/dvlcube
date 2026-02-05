const express = require('express')
const router = express.Router()
const { spawn } = require('child_process')
const fs = require('fs').promises
const path = require('path')
const os = require('os')
const crypto = require('crypto')

// Configuration
const EXECUTION_TIMEOUT = 10000 // 10 seconds
const MAX_OUTPUT_SIZE = 50000 // 50KB max output

// Helper to create a unique temp directory
async function createTempDir() {
    const tempBase = os.tmpdir()
    const uniqueDir = path.join(tempBase, `sandbox-${crypto.randomBytes(8).toString('hex')}`)
    await fs.mkdir(uniqueDir, { recursive: true })
    return uniqueDir
}

// Helper to cleanup temp directory
async function cleanupTempDir(dir) {
    try {
        await fs.rm(dir, { recursive: true, force: true })
    } catch (err) {
        console.error('Cleanup error:', err)
    }
}

// Helper to execute a command with timeout
function executeCommand(command, args, options = {}) {
    return new Promise((resolve) => {
        const startTime = Date.now()
        let stdout = ''
        let stderr = ''
        let killed = false

        const proc = spawn(command, args, {
            cwd: options.cwd,
            timeout: EXECUTION_TIMEOUT,
            shell: false
        })

        const timeout = setTimeout(() => {
            killed = true
            proc.kill('SIGKILL')
        }, EXECUTION_TIMEOUT)

        proc.stdout.on('data', (data) => {
            if (stdout.length < MAX_OUTPUT_SIZE) {
                stdout += data.toString()
            }
        })

        proc.stderr.on('data', (data) => {
            if (stderr.length < MAX_OUTPUT_SIZE) {
                stderr += data.toString()
            }
        })

        proc.on('close', (code) => {
            clearTimeout(timeout)
            const executionTime = Date.now() - startTime
            resolve({
                exitCode: code,
                stdout: stdout.substring(0, MAX_OUTPUT_SIZE),
                stderr: stderr.substring(0, MAX_OUTPUT_SIZE),
                executionTime,
                killed
            })
        })

        proc.on('error', (err) => {
            clearTimeout(timeout)
            resolve({
                exitCode: -1,
                stdout: '',
                stderr: err.message,
                executionTime: Date.now() - startTime,
                killed: false,
                error: err.message
            })
        })
    })
}

// Execute Python code
router.get('/python', async (req, res) => {
    const { code } = req.query

    if (!code) {
        return res.status(400).json({ error: 'Code is required' })
    }

    let tempDir = null
    try {
        tempDir = await createTempDir()
        const filePath = path.join(tempDir, 'script.py')
        await fs.writeFile(filePath, code, 'utf8')

        const result = await executeCommand('python3', [filePath], { cwd: tempDir })

        res.json({
            language: 'python',
            success: result.exitCode === 0 && !result.killed,
            output: result.stdout || result.stderr,
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
            executionTime: `${result.executionTime}ms`,
            timeout: result.killed
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    } finally {
        if (tempDir) await cleanupTempDir(tempDir)
    }
})

// Execute TypeScript code (using ts-node or transpile + node)
router.get('/typescript', async (req, res) => {
    const { code } = req.query

    if (!code) {
        return res.status(400).json({ error: 'Code is required' })
    }

    let tempDir = null
    try {
        tempDir = await createTempDir()
        const filePath = path.join(tempDir, 'script.ts')
        await fs.writeFile(filePath, code, 'utf8')

        // Try ts-node first, fall back to npx ts-node
        let result = await executeCommand('npx', ['ts-node', '--transpile-only', filePath], { cwd: tempDir })

        // If ts-node not available, try using esbuild + node
        if (result.exitCode !== 0 && result.stderr.includes('not found')) {
            // Fallback: transpile with esbuild and run with node
            const jsPath = path.join(tempDir, 'script.js')
            const transpileResult = await executeCommand('npx', ['esbuild', filePath, '--outfile=' + jsPath], { cwd: tempDir })
            if (transpileResult.exitCode === 0) {
                result = await executeCommand('node', [jsPath], { cwd: tempDir })
            }
        }

        res.json({
            language: 'typescript',
            success: result.exitCode === 0 && !result.killed,
            output: result.stdout || result.stderr,
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
            executionTime: `${result.executionTime}ms`,
            timeout: result.killed
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    } finally {
        if (tempDir) await cleanupTempDir(tempDir)
    }
})

// Execute Java code
router.get('/java', async (req, res) => {
    const { code } = req.query

    if (!code) {
        return res.status(400).json({ error: 'Code is required' })
    }

    let tempDir = null
    try {
        tempDir = await createTempDir()
        
        // Extract class name from code (look for public class or just class)
        const classMatch = code.match(/(?:public\s+)?class\s+(\w+)/)
        const className = classMatch ? classMatch[1] : 'Main'
        
        const filePath = path.join(tempDir, `${className}.java`)
        await fs.writeFile(filePath, code, 'utf8')

        // Compile
        const compileResult = await executeCommand('javac', [filePath], { cwd: tempDir })
        
        if (compileResult.exitCode !== 0) {
            return res.json({
                language: 'java',
                success: false,
                phase: 'compilation',
                output: compileResult.stderr,
                stdout: compileResult.stdout,
                stderr: compileResult.stderr,
                exitCode: compileResult.exitCode,
                executionTime: `${compileResult.executionTime}ms`,
                timeout: compileResult.killed
            })
        }

        // Run
        const runResult = await executeCommand('java', ['-cp', tempDir, className], { cwd: tempDir })

        res.json({
            language: 'java',
            success: runResult.exitCode === 0 && !runResult.killed,
            phase: 'execution',
            output: runResult.stdout || runResult.stderr,
            stdout: runResult.stdout,
            stderr: runResult.stderr,
            exitCode: runResult.exitCode,
            executionTime: `${runResult.executionTime}ms`,
            timeout: runResult.killed
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    } finally {
        if (tempDir) await cleanupTempDir(tempDir)
    }
})

// Execute JavaScript code (Node.js)
router.get('/javascript', async (req, res) => {
    const { code } = req.query

    if (!code) {
        return res.status(400).json({ error: 'Code is required' })
    }

    let tempDir = null
    try {
        tempDir = await createTempDir()
        const filePath = path.join(tempDir, 'script.js')
        await fs.writeFile(filePath, code, 'utf8')

        const result = await executeCommand('node', [filePath], { cwd: tempDir })

        res.json({
            language: 'javascript',
            success: result.exitCode === 0 && !result.killed,
            output: result.stdout || result.stderr,
            stdout: result.stdout,
            stderr: result.stderr,
            exitCode: result.exitCode,
            executionTime: `${result.executionTime}ms`,
            timeout: result.killed
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    } finally {
        if (tempDir) await cleanupTempDir(tempDir)
    }
})

module.exports = router
