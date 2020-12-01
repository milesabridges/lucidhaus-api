const User = require('../models/user')
const {errorHandler} = require('../helpers/dbErrorHandler')
const jwt = require('jsonwebtoken') // to generate signed token
const expressJwt = require('express-jwt') // for auth


exports.signup = (req, res) => {
    const user = new User(req.body)
    user.save((error, user) => {
        if (error) {
            return res.status(400).json({
                error: errorHandler(error)
            })
        }
        user.salt = undefined
        user.hashed_password = undefined
        res.json({
            user
        })
    })
}

exports.signin = (req, res) => {
    const {email, password} = req.body
    User.findOne({email}, (error, user) => {
        if (error || !user) {
            return res.status(400).json({
                error: "This email isn't associated with an account"
            })
        }

        //if User is found make sure email and pw match
        //create auth method in User model
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: 'incorrect password'
            })
        }

        //generate a signed token
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
        //persist the token as 't' in cookie with expiry date

        res.cookie('t', token, {expire: new Date() + 9999})

        //return res to front end
        const {_id, name, email, role} = user
        return res.json({token, user: {_id, email, name, role}})

    })
}

exports.signout = (req, res) => {
    res.clearCookie('t')
    res.json({
        message: 'Signout Success'
    })
}

exports.requireSignIn = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth',
    algorithms: ['RS256']
})


exports.isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    if (!user) {
        return res.status(403).json({
            error: 'Access denied'
        })
    }

    next()
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0)
        return res.status(403).json({
            error: 'Admin resource. Access denied'
        })

    next()
}