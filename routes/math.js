const express = require('express')
const router = express.Router()

function parseNumber(v) {
    if (v === undefined || v === null) return null
    const n = Number(String(v).trim())
    return Number.isFinite(n) ? n : null
}

// GET /math/rule-of-three?a=...&b=...&c=...
// Solves x for a/b = c/x => x = (b * c) / a
router.get('/rule-of-three', (req, res) => {
    const a = parseNumber(req.query.a)
    const b = parseNumber(req.query.b)
    const c = parseNumber(req.query.c)

    if (a === null || b === null || c === null) {
        return res.status(400).json({ success: false, error: 'Invalid or missing numeric parameters a, b, c' })
    }

    if (a === 0) return res.status(400).json({ success: false, error: 'Parameter a must not be zero' })

    const x = (b * c) / a
    return res.json({ success: true, input: { a, b, c }, result: x })
})

// GET /math/percentage/of?percent=15&total=200
router.get('/percentage/of', (req, res) => {
    const percent = parseNumber(req.query.percent)
    const total = parseNumber(req.query.total)

    if (percent === null || total === null) {
        return res.status(400).json({ success: false, error: 'Invalid or missing parameters: percent, total' })
    }

    const value = (percent / 100) * total
    return res.json({ success: true, input: { percent, total }, result: value })
})

// GET /math/percentage/what-percent?part=50&total=200
router.get('/percentage/what-percent', (req, res) => {
    const part = parseNumber(req.query.part)
    const total = parseNumber(req.query.total)

    if (part === null || total === null) {
        return res.status(400).json({ success: false, error: 'Invalid or missing parameters: part, total' })
    }

    if (total === 0) return res.status(400).json({ success: false, error: 'Parameter total must not be zero' })

    const percent = (part / total) * 100
    return res.json({ success: true, input: { part, total }, result: percent })
})

// GET /math/percentage/change?original=100&percent=10&direction=increase
router.get('/percentage/change', (req, res) => {
    const original = parseNumber(req.query.original)
    const percent = parseNumber(req.query.percent)
    const direction = (req.query.direction || 'increase').toLowerCase()

    if (original === null || percent === null) {
        return res.status(400).json({ success: false, error: 'Invalid or missing parameters: original, percent' })
    }

    let result
    if (direction === 'decrease') {
        result = original * (1 - percent / 100)
    } else {
        result = original * (1 + percent / 100)
    }

    return res.json({ success: true, input: { original, percent, direction }, result })
})

module.exports = router
