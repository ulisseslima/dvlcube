const express = require('express')
const passport = require('passport')

const router = express.Router()

// Initiate Google OAuth login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/auth/login',
        failureMessage: true
    }),
    (req, res) => {
        // Successful authentication, redirect to originally requested page or products
        const returnTo = req.session.returnTo || '/products'
        delete req.session.returnTo
        res.redirect(returnTo)
    }
)

// Login page
router.get('/login', (req, res) => {
    // If already authenticated, redirect to products
    if (req.isAuthenticated()) {
        return res.redirect('/products')
    }
    res.render('pages/auth/login', { 
        error: req.session.messages ? req.session.messages[0] : null 
    })
})

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        res.redirect('/')
    })
})

module.exports = router
