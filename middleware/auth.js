const jwt = require('jsonwebtoken')
require('dotenv').config()

function authenticateToken(req, res, next){
    const authToken = req.headers['authorization']

    const token = authToken && authToken.split(' ')[1]

    if (token ===null){res.status(401).send('Token Expired')}
    
    jwt.verify(token, process.env.SECRET_KEY, (error, user)=>{
        if (error) return res.status(403).send(error)
        req.user = user
        next()
    })
}

module.exports = authenticateToken 