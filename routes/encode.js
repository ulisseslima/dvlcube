const express = require('express')
const router = express.Router()

// URL Encoding
router.get('/url', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=your text here"})
        
        res.json({
            encoded: encodeURIComponent(text),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// URL Decoding
router.get('/url/decode', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=your%20encoded%20text"})
        
        res.json({
            decoded: decodeURIComponent(text),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// Base64 Encoding
router.get('/base64', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=your text here"})
        
        res.json({
            encoded: Buffer.from(text).toString('base64'),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// Base64 Decoding
router.get('/base64/decode', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=eW91ciBiYXNlNjQgdGV4dA=="})
        
        res.json({
            decoded: Buffer.from(text, 'base64').toString('utf-8'),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// HTML Entity Encoding
router.get('/html', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=<div>Hello</div>"})
        
        res.json({
            encoded: encodeHtmlEntities(text),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// HTML Entity Decoding
router.get('/html/decode', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=&lt;div&gt;Hello&lt;/div&gt;"})
        
        res.json({
            decoded: decodeHtmlEntities(text),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// Hex Encoding
router.get('/hex', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=your text here"})
        
        res.json({
            encoded: Buffer.from(text).toString('hex'),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// Hex Decoding
router.get('/hex/decode', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=48656c6c6f"})
        
        res.json({
            decoded: Buffer.from(text, 'hex').toString('utf-8'),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// ASCII to Unicode code points
router.get('/unicode', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=Hello"})
        
        const codePoints = [...text].map(char => 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'))
        
        res.json({
            codePoints: codePoints,
            encoded: codePoints.join(' '),
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// Unicode to string
router.get('/unicode/decode', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=U+0048 U+0065 U+006C U+006C U+006F"})
        
        const decoded = text.split(/\s+/)
            .map(cp => String.fromCodePoint(parseInt(cp.replace('U+', ''), 16)))
            .join('')
        
        res.json({
            decoded: decoded,
            original: text
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error " + err})
    }
})

// JWT Decode (without verification)
router.get('/jwt/decode', async (req, res) => {
    try {
        let token = req.query.text
        if (!token) return res.json({message: "empty", hint: "Use ?text=your.jwt.token"})
        
        const parts = token.split('.')
        if (parts.length !== 3) {
            return res.status(400).json({error: "Invalid JWT format. Expected 3 parts separated by dots."})
        }
        
        const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf-8'))
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'))
        
        res.json({
            header: header,
            payload: payload,
            signature: parts[2],
            original: token
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({error: "Error decoding JWT: " + err})
    }
})

module.exports = router

// Helper functions
function encodeHtmlEntities(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function decodeHtmlEntities(text) {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
}
