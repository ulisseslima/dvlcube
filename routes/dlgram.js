const express = require('express')
const router = express.Router()
const { pgPool } = require('../pgpool')

router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', async (req, res) => {
    try {
        const part0 = await pgPool().query("SELECT value, gender FROM part0 OFFSET floor(random()*(select count(*) from part0)) LIMIT 1")
        const p0 = part0.rows[0].value
        let gender = part0.rows[0].gender

        let condition = `gender = ${gender} or gender = 0`
        if (gender == 0) condition = '1=1'

        console.log("result: ", result)
        res.render('pages/curse/index', result )
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

module.exports = router
