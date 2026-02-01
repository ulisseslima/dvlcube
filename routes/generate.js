const express = require('express')
const router = express.Router()

router.get('/cnpj', async (req, res) => {
    res.json({"cnpj": generateCnpj()})
})

router.get('/cpf', async (req, res) => {
    res.json({"cpf": generateCpf()})
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

function generateCnpj() {
	let n = 9
	let n1 = gera_random(n)
	let n2 = gera_random(n)
	let n3 = gera_random(n)
	let n4 = gera_random(n)
	let n5 = gera_random(n)
	let n6 = gera_random(n)
	let n7 = gera_random(n)
	let n8 = gera_random(n)
	let n9 = 0;//gera_random(n);
	let n10 = 0;//gera_random(n);
	let n11 = 0;//gera_random(n);
	let n12 = 1;//gera_random(n);
	let d1 = n12*2+n11*3+n10*4+n9*5+n8*6+n7*7+n6*8+n5*9+n4*2+n3*3+n2*4+n1*5
	d1 = 11 - ( mod(d1,11) )
	if (d1>=10) d1 = 0
	let d2 = d1*2+n12*3+n11*4+n10*5+n9*6+n8*7+n7*8+n6*9+n5*2+n4*3+n3*4+n2*5+n1*6
	d2 = 11 - ( mod(d2,11) )
	if (d2>=10) d2 = 0

	return ''+n1+n2+'.'+n3+n4+n5+'.'+n6+n7+n8+'/'+n9+n10+n11+n12+'-'+d1+d2
}

function generateCpf() {
	let num1 = aleatorio();
	let num2 = aleatorio();
	let num3 = aleatorio();
	
	let dig1 = digPri(num1,num2,num3);
	let dig2 = digSeg(num1,num2,num3,dig1);
	let cpf= num1+"."+num2+"."+num3+"-"+dig1+""+dig2;
	console.log(cpf);
	return cpf;
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