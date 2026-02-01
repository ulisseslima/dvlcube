/**
 * Authentication middleware for protecting routes
 */

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    
    // Store the original URL to redirect back after login
    req.session.returnTo = req.originalUrl
    res.redirect('/auth/login')
}

// Middleware to check if user is NOT authenticated (for login pages)
function ensureGuest(req, res, next) {
    if (!req.isAuthenticated()) {
        return next()
    }
    res.redirect('/products')
}

module.exports = {
    ensureAuthenticated,
    ensureGuest
}
