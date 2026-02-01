const express = require('express')
const router = express.Router()

// Route metadata for the tools page
const routeMetadata = {
    generate: {
        name: 'Generate',
        description: 'Generate valid documents and data',
        icon: 'create',
        routes: [
            { path: '/generate/cnpj', method: 'GET', name: 'Generate CNPJ', description: 'Generate a valid Brazilian CNPJ', params: [] },
            { path: '/generate/cpf', method: 'GET', name: 'Generate CPF', description: 'Generate a valid Brazilian CPF', params: [] },
            { path: '/generate/title', method: 'GET', name: 'Capitalize Title', description: 'Capitalize a title using style guide rules', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter your title here' },
                { name: 'style', type: 'select', required: false, options: ['APA', 'AP', 'CHICAGO', 'MLA', 'BB', 'AMA'], default: 'APA' }
            ]}
        ]
    },
    validate: {
        name: 'Validate',
        description: 'Validate documents and data',
        icon: 'check_circle',
        routes: [
            { path: '/validate/cnpj', method: 'GET', name: 'Validate CNPJ', description: 'Validate a Brazilian CNPJ', params: [
                { name: 'n', type: 'text', required: true, placeholder: 'Enter CNPJ (with or without formatting)' }
            ]},
            { path: '/validate/cpf', method: 'GET', name: 'Validate CPF', description: 'Validate a Brazilian CPF', params: [
                { name: 'n', type: 'text', required: true, placeholder: 'Enter CPF (with or without formatting)' }
            ]}
        ]
    },
    encode: {
        name: 'Encode/Decode',
        description: 'Encoding and decoding utilities',
        icon: 'code',
        routes: [
            { path: '/encode/url', method: 'GET', name: 'URL Encode', description: 'Encode text for URLs', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter text to encode' }
            ]},
            { path: '/encode/url/decode', method: 'GET', name: 'URL Decode', description: 'Decode URL-encoded text', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter URL-encoded text' }
            ]},
            { path: '/encode/base64', method: 'GET', name: 'Base64 Encode', description: 'Encode text to Base64', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter text to encode' }
            ]},
            { path: '/encode/base64/decode', method: 'GET', name: 'Base64 Decode', description: 'Decode Base64 text', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter Base64 text' }
            ]},
            { path: '/encode/html', method: 'GET', name: 'HTML Encode', description: 'Encode HTML entities', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter HTML to encode' }
            ]},
            { path: '/encode/html/decode', method: 'GET', name: 'HTML Decode', description: 'Decode HTML entities', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter encoded HTML' }
            ]},
            { path: '/encode/hex', method: 'GET', name: 'Hex Encode', description: 'Encode text to hexadecimal', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter text to encode' }
            ]},
            { path: '/encode/hex/decode', method: 'GET', name: 'Hex Decode', description: 'Decode hexadecimal to text', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter hex string' }
            ]},
            { path: '/encode/unicode', method: 'GET', name: 'Unicode Encode', description: 'Convert text to Unicode code points', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'Enter text to encode' }
            ]},
            { path: '/encode/unicode/decode', method: 'GET', name: 'Unicode Decode', description: 'Convert Unicode code points to text', params: [
                { name: 'text', type: 'text', required: true, placeholder: 'U+0048 U+0065 U+006C U+006C U+006F' }
            ]},
            { path: '/encode/jwt/decode', method: 'GET', name: 'JWT Decode', description: 'Decode JWT token (without verification)', params: [
                { name: 'text', type: 'textarea', required: true, placeholder: 'Enter JWT token' }
            ]}
        ]
    }
}

// Render the tools page
router.get('/', async (req, res) => {
    res.render('pages/tools/index', { routeMetadata })
})

// API endpoint to get route metadata
router.get('/api/routes', async (req, res) => {
    res.json(routeMetadata)
})

module.exports = router
