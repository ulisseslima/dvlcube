// https://www.sitepoint.com/understanding-module-exports-exports-node-js/
// https://stackoverflow.com/questions/40294870/module-exports-vs-export-default-in-node-js-and-es6
// import { Router } from 'express'
const express = require('express')
const router = express.Router()
const { pgPool } = require('../pgpool')
const cool = require('cool-ascii-faces')

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/db', async (req, res) => {
    try {
      const result = await pgPool().query('SELECT * FROM part1')
      const results = { 'results': (result) ? result.rows : null}
      res.render('pages/curse/db', results )
    } catch (err) {
      console.error(err)
      res.send("Error " + err)
    }
})

router.get('/', async (req, res) => {
    // const client = await pool.connect()
    try {
        const part0 = await pgPool().query("SELECT value, gender FROM part0 OFFSET floor(random()*(select count(*) from part0)) LIMIT 1")
        const p0 = part0.rows[0].value
        let gender = part0.rows[0].gender

        let condition = `gender = ${gender} or gender = 0`
        if (gender == 0) condition = '1=1'

        const part1 = await pgPool().query(`
        SELECT value, gender FROM part1 where ${condition} OFFSET floor(random()*(select count(*) from part1 where ${condition})) LIMIT 1
        `)
        const p1 = part1.rows[0].value
        gender = part1.rows[0].gender || gender

        condition = `gender = ${gender} or gender = 0`
        if (gender == 0) condition = '1=1'

        const part2 = await pgPool().query(`
        SELECT value, gender FROM part2 where ${condition} 
        OFFSET floor(random()*(select count(*) from part2 where ${condition})) LIMIT 1
        `)
        const p2 = part2.rows[0].value
        gender = part2.rows[0].gender || gender
        if (gender != 0) condition = `gender = ${gender} or gender = 0`

        const part3 = await pgPool().query(`
        SELECT value FROM part3 where ${condition} 
        OFFSET floor(random()*(select count(*) from part3 where ${condition})) LIMIT 1
        `)
        const p3 = part3.rows[0].value
        
        const result = { 
        'face': cool(),
        'p0': p0,
        'p1': p1,
        'p2': p2,
        'p3': p3
        }

        console.log("result: ", result)
        res.render('pages/curse/index', result )
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    } finally {
        // client.release()
    }
})

module.exports = router
// export default router
