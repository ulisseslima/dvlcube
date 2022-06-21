const express = require('express')
const moment = require('moment')

const router = express.Router()
const { pgPool } = require('../pgpool')

router.get('/:pid', async (req, res) => {
    try {
        const results = await pgPool().query("SELECT * FROM products where id = $1", [req.params.pid])
        let product = results.rows[0]

        console.log("result: ", product)
        res.render('pages/products/index', product)
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

router.get('/ops/:pid', async (req, res) => {
    try {
        const qproduct_name = await pgPool().query(`
            SELECT name FROM products where id = $1
            `, [req.params.pid]
        )

        if (!qproduct_name.rows) {
            throw Error("product not found: "+req.params.pid)
        }

        let product_name = qproduct_name.rows[0].name
        console.log("detailing "+product_name)

        const qresults = await pgPool().query(`
            SELECT 
                op.*,
                store.name store_name,
                product.brand,
                product.name product_name
            FROM product_ops op
            JOIN products product on product.id=op.product_id
            JOIN stores store on store.id=op.store_id
            WHERE product.name = $1
            ORDER BY op.created DESC
            `, [product_name]
        )
        
        let results = qresults.rows
        console.log("result size: " + results.length)

        const result = {
            'product': product_name,
            'pops': results,
            'df': moment
        }
        res.render('pages/pops/index', result)
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

router.get('/ops/brand/:name', async (req, res) => {
    try {
        let name = req.params.name
        console.log("detailing brand "+name)

        const qresults = await pgPool().query(`
            SELECT 
                op.*,
                store.name store_name,
                product.brand,
                product.name product_name
            FROM product_ops op
            JOIN products product on product.id=op.product_id
            JOIN stores store on store.id=op.store_id
            WHERE product.brand = $1
            ORDER BY op.created DESC
            `, [name]
        )
        
        let results = qresults.rows
        console.log("result size: " + results.length)

        const result = {
            'product': name,
            'pops': results,
            'df': moment
        }
        res.render('pages/pops/index', result)
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

router.get('/ops/store/:name', async (req, res) => {
    try {
        let name = req.params.name
        console.log("detailing brand "+name)

        const qresults = await pgPool().query(`
            SELECT 
                op.*,
                store.name store_name,
                product.brand,
                product.name product_name
            FROM product_ops op
            JOIN products product on product.id=op.product_id
            JOIN stores store on store.id=op.store_id
            WHERE store.name = $1
            ORDER BY op.created DESC
            `, [name]
        )
        
        let results = qresults.rows
        console.log("result size: " + results.length)

        const result = {
            'product': name,
            'pops': results,
            'df': moment
        }
        res.render('pages/pops/index', result)
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

router.get('/', async (req, res) => {
    try {
        let filter = (req.query.filter || '')
        const results = await pgPool().query(`
                SELECT * 
                FROM products
                WHERE name ILIKE $1
                ORDER BY name
            `, ['%'+filter+'%']
        )

        let productList = results.rows
        console.log("result size: " + productList.length)

        const result = { 
            'products': productList
        }

        res.render('pages/products/index', result)
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

router.post('/', async (req, res) => {
    try {
        const results = await pgPool().query("insert into products $1", ['%'+req.params.pname+'%'])
        let product = results.rows[0]

        console.log("result: ", product)
        res.render('pages/products/index', result )
    } catch (err) {
        console.error(err)
        res.send("Error " + err)
    }
})

module.exports = router
