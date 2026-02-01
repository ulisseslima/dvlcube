const express = require('express')
const router = express.Router()

router.get('/cnpj', async (req, res) => {
    const alphanumeric = req.query.alphanumeric === 'true' || req.query.alfa === 'true'
    const mask = req.query.mask !== 'false' // Default to true
    res.json({"cnpj": generateCnpj(alphanumeric, mask)})
})

router.get('/cpf', async (req, res) => {
    const mask = req.query.mask !== 'false' // Default to true
    res.json({"cpf": generateCpf(mask)})
})

router.get('/title', async (req, res) => {
    try {
        let text = req.query.text
        if (!text) return res.json({message: "empty", hint: "Use ?text=your title here&style=APA"})
        
        let style = (req.query.style || 'APA').toUpperCase()
        let result = capitalizedTitle(text, style)
        res.json({"title": result, "style": style})
    } catch (err) {
        console.error(err)
        res.status(500).send("Error " + err)
    }
})

module.exports = router

function gera_random(n) {
	let ranNum = Math.round(Math.random()*n)
		return ranNum
	}

function mod(dividendo,divisor) {
	return Math.round(dividendo - (Math.floor(dividendo/divisor)*divisor))
}

function generateCnpj(alphanumeric = false, mask = true) {
	let base = ''
	
	// Generate first 12 characters
	for (let i = 0; i < 12; i++) {
		if (alphanumeric && Math.random() < 0.5) {
			// Generate uppercase letter (A-Z)
			base += String.fromCharCode(65 + Math.floor(Math.random() * 26))
		} else {
			// Generate digit (0-9)
			base += Math.floor(Math.random() * 10)
		}
	}
	
	// Convert to values array
	let values = []
	for (let i = 0; i < 12; i++) {
		let char = base.charAt(i)
		if (char >= '0' && char <= '9') {
			values[i] = parseInt(char)
		} else {
			// Letter: convert using ASCII (A=17, B=18, etc.)
			values[i] = char.charCodeAt(0) - 48
		}
	}
	
	// Calculate first check digit
	const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
	values[12] = calculateCheckDigit(values, 12, weights1)
	
	// Calculate second check digit
	const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
	values[13] = calculateCheckDigit(values, 13, weights2)
	
	// Build final CNPJ
	const cnpj = base + values[12] + values[13]
	
	// Return with or without mask
	if (mask) {
		// Format: XX.XXX.XXX/XXXX-XX
		return cnpj.substring(0, 2) + '.' + 
		       cnpj.substring(2, 5) + '.' + 
		       cnpj.substring(5, 8) + '/' + 
		       cnpj.substring(8, 12) + '-' + 
		       cnpj.substring(12, 14)
	} else {
		// Return unformatted
		return cnpj
	}
}

function calculateCheckDigit(values, length, weights) {
	let sum = 0
	for (let i = 0; i < length; i++) {
		sum += values[i] * weights[i]
	}
	let remainder = sum % 11
	return remainder < 2 ? 0 : 11 - remainder
}

function generateCpf(mask = true) {
	let num1 = aleatorio();
	let num2 = aleatorio();
	let num3 = aleatorio();
	
	let dig1 = digPri(num1,num2,num3);
	let dig2 = digSeg(num1,num2,num3,dig1);
	
	if (mask) {
		let cpf = num1+"."+num2+"."+num3+"-"+dig1+""+dig2;
		console.log(cpf);
		return cpf;
	} else {
		let cpf = num1+num2+num3+dig1+dig2;
		console.log(cpf);
		return cpf;
	}
}
	
	
function digPri(n1,n2,n3) {
	let nn1 = n1.split("");
	let nn2 = n2.split("");
	let nn3 = n3.split("");
	let nums = nn1.concat(nn2,nn3);
	
	let x = 0;
	let j = 0;
	for (let i=10;i>=2;i--) {
		x += parseInt(nums[j++]) * i;
	}
	let y = x % 11;
	if (y < 2) {
		return 0;
	} else {
		return 11-y;
	}
}
	
function digSeg(n1,n2,n3,n4) {
	let nn1 = n1.split("");
	let nn2 = n2.split("");
	let nn3 = n3.split("");
	let nums = nn1.concat(nn2,nn3);
	nums[9] = n4;
	let x = 0;
	let j = 0;
	for (let i=11;i>=2;i--) {
		x += parseInt(nums[j++]) * i;
	}
	let y = x % 11;
	if (y < 2) {
		return 0;
	} else {
		return 11-y;
	}
}
	
function aleatorio() {
	let aleat = Math.floor(Math.random() * 999);
	if (aleat < 100) {
		if (aleat < 10) {
			return "00"+aleat;
		} else {
			return "0"+aleat;
		}
	} else {
		return ""+aleat;
	}
}

/**
 * Capitalizes a title according to the specified style guide rules
 * @param {string} text - The text to capitalize
 * @param {string} style - The style guide to use: APA, AP, Chicago, MLA, BB (Bluebook), AMA
 * @returns {string} - The capitalized title
 */
function capitalizedTitle(text, style = 'APA') {
    if (!text) return ''
    
    // Common lowercase words for different styles
    const styleRules = {
        // APA: Lowercase articles (a, an, the), short prepositions (under 4 letters), and coordinating conjunctions
        APA: {
            lowercase: ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to', 'up', 'via'],
            capitalizeAfterColon: true
        },
        // AP: Similar to APA but prepositions under 4 letters are lowercase
        AP: {
            lowercase: ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to', 'up'],
            capitalizeAfterColon: true
        },
        // Chicago: Lowercase articles, prepositions, and coordinating conjunctions regardless of length
        CHICAGO: {
            lowercase: ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to', 'up', 'via', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'off', 'over', 'under', 'again', 'further', 'then', 'once'],
            capitalizeAfterColon: true
        },
        // MLA: Similar to Chicago
        MLA: {
            lowercase: ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to', 'up', 'via', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'off', 'over', 'under'],
            capitalizeAfterColon: false
        },
        // Bluebook (legal): Capitalize articles, conjunctions, and prepositions of 4 letters or less
        BB: {
            lowercase: ['a', 'an', 'the', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'to', 'up', 'yet'],
            capitalizeAfterColon: true
        },
        // AMA (medical): Similar to APA
        AMA: {
            lowercase: ['a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to', 'up', 'via'],
            capitalizeAfterColon: true
        }
    }
    
    const rules = styleRules[style.toUpperCase()] || styleRules.APA
    const lowercaseWords = new Set(rules.lowercase)
    
    // Split by spaces while preserving multiple spaces
    const words = text.split(/(\s+)/)
    let isFirstWord = true
    let afterColon = false
    
    const result = words.map((word, index) => {
        // Skip whitespace
        if (/^\s+$/.test(word)) return word
        
        const lowerWord = word.toLowerCase()
        const endsWithColon = word.endsWith(':')
        
        let capitalizedWord
        
        // Always capitalize first word and last word
        if (isFirstWord || index === words.length - 1) {
            capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }
        // Capitalize after colon if style requires it
        else if (afterColon && rules.capitalizeAfterColon) {
            capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }
        // Check if word should be lowercase
        else if (lowercaseWords.has(lowerWord.replace(/[^a-z]/g, ''))) {
            capitalizedWord = lowerWord
        }
        // Capitalize other words
        else {
            capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }
        
        isFirstWord = false
        afterColon = endsWithColon
        
        return capitalizedWord
    })
    
    return result.join('')
}