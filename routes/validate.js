const express = require('express')
const router = express.Router()

router.get('/cnpj', async (req, res) => {
    try {
        let number = req.query.n
        if (!number) res.json({message:"empty"})

        let valid = validateCnpj(number)
		if (!valid) {
			res.status(406)
		}
		
        res.json({"valid": valid})
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

router.get('/cpf', async (req, res) => {
    try {
        let number = req.query.n
        if (!number) res.json({message:"empty"})

        let valid = validateCpf(number)
		if (!valid) {
			res.status(406)
		}

        res.json({"valid": valid})
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

module.exports = router

function validateCpf(cpf) {
	let exp = /\.|\-/g
	cpf = cpf.toString().replace(exp, "");
	let numeros,
		digitos,
		soma,
		i,
		resultado,
		digitos_iguais
    
	digitos_iguais = 1
	if (cpf.length != 11)
		return false
    
	for (i = 0; i < cpf.length - 1; i++)
		if (cpf.charAt(i) != cpf.charAt(i + 1)) {
			digitos_iguais = 0
			break
	}

	if (!digitos_iguais) {
		numeros = cpf.substring(0, 9)
		digitos = cpf.substring(9)
		soma = 0
		for (i = 10; i > 1; i--) {
			soma += numeros.charAt(10 - i) * i
        }
		resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
		if (resultado != digitos.charAt(0))
			return false
        
		numeros = cpf.substring(0, 10)
		soma = 0
		for (i = 11; i > 1; i--)
			soma += numeros.charAt(11 - i) * i
		resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
		return resultado == digitos.charAt(1);
	} else {
		return false
    }
}

function validateCnpj(cnpj) {
	if (!cnpj) return false
	
	// Remove mask (dots, dashes, slashes)
	let exp = /\.|\-|\//g
	cnpj = cnpj.toString().toUpperCase().replace(exp, "")
	
	// Adjust size to 14 characters
	if (cnpj.length !== 14) return false
	
	// Check if all characters are alphanumeric (A-Z or 0-9)
	if (!/^[A-Z0-9]{14}$/.test(cnpj)) return false
	
	// Convert to values array
	let values = []
	for (let i = 0; i < 14; i++) {
		let char = cnpj.charAt(i)
		if (char >= '0' && char <= '9') {
			values[i] = parseInt(char)
		} else {
			// Letter: convert using ASCII value minus 48
			values[i] = char.charCodeAt(0) - 48
		}
	}
	
	// Check if all characters are the same (repeated)
	let allSame = true
	for (let i = 1; i < 14; i++) {
		if (values[i] !== values[0]) {
			allSame = false
			break
		}
	}
	if (allSame) return false
	
	// Calculate and verify first check digit
	const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
	let sum1 = 0
	for (let i = 0; i < 12; i++) {
		sum1 += values[i] * weights1[i]
	}
	let checkDigit1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11)
	
	// Calculate and verify second check digit
	const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
	let sum2 = 0
	for (let i = 0; i < 13; i++) {
		sum2 += values[i] * weights2[i]
	}
	let checkDigit2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11)
	
	return checkDigit1 === values[12] && checkDigit2 === values[13]
}