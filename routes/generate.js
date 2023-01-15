const express = require('express')
const router = express.Router()

router.get('/cnpj', async (req, res) => {
    res.json({"cnpj": generateCnpj()})
})

router.get('/cpf', async (req, res) => {
    res.json({"cpf": generateCpf()})
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

	resultado = ''+n1+n2+'.'+n3+n4+n5+'.'+n6+n7+n8+'/'+n9+n10+n11+n12+'-'+d1+d2
	return resultado
}

function generateCpf() {
	var num1 = aleatorio().toString();
	var num2 = aleatorio().toString();
	var num3 = aleatorio().toString();
	
	var dig1 = digPri(num1,num2,num3);
	var dig2 = digSeg(num1,num2,num3,dig1);
	var cpf= num1+"."+num2+"."+num3+"-"+dig1+""+dig2;
	console.log(cpf);
	return cpf;
}
	
	
function digPri(n1,n2,n3) {
	var nn1 = n1.split("");
	var nn2 = n2.split("");
	var nn3 = n3.split("");
	var nums = nn1.concat(nn2,nn3);
	
	var x = 0;
	var j = 0;
	for (var i=10;i>=2;i--) {
		x += parseInt(nums[j++]) * i;
	}
	var y = x % 11;
	if (y < 2) {
		return 0;
	} else {
		return 11-y;
	}
}
	
function digSeg(n1,n2,n3,n4) {
	var nn1 = n1.split("");
	var nn2 = n2.split("");
	var nn3 = n3.split("");
	var nums = nn1.concat(nn2,nn3);
	nums[9] = n4;
	var x = 0;
	var j = 0;
	for (var i=11;i>=2;i--) {
		x += parseInt(nums[j++]) * i;
	}
	var y = x % 11;
	if (y < 2) {
		return 0;
	} else {
		return 11-y;
	}
}
	
function aleatorio() {
	var aleat = Math.floor(Math.random() * 999);
	if (aleat < 100) {
		if (aleat < 10) {
			return "00"+aleat;
		} else {
			return "0"+aleat;
		}
	} else {
		return aleat;
	}
}