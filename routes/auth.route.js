const express = require('express')
const router = require('express').Router()
const pool = require('../db')
const bcrypt = require('bcrypt')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
require('dotenv').config()


function RegisterUser(user){
    const schema = Joi.object({
        first_name : Joi.string().min(2).required(),
        last_name : Joi.string().min(2).required(),
        username : Joi.string().min(2).required(),
        email : Joi.string().email().required(),
        password : Joi.string().min(7).required(),
        confirm_password : Joi.string().min(7).required()
    })
    return schema.validate(user)
}

function LoginUser(user){
    const schema = Joi.object({
        email : Joi.string().email(),
        password : Joi.string().min(7).required()
    })
    return schema.validate(user)
}


//Route to register user
router.post('/register', async(req, res)=>{
    const {error} = RegisterUser(req.body)
    if (error){
        return res.status(400).json(error.details[0].message)
    }

    const { first_name, last_name,username, email, password, confirm_password } = req.body;
    if (password != confirm_password){
        return res.status(400).json("Password does not match confirm password")
    }
    const hashed_password = await bcrypt.hash(password, 10)

    try {
        const new_user = await pool.query('INSERT INTO "user"(first_name, last_name,username, email, password) VALUES($1,$2,$3,$4,$5) RETURNING *', [first_name, last_name,username, email,hashed_password])
        
        const payload = {
            id: new_user.rows[0].id,
            email : email
        }
        const token = jwt.sign(payload, process.env.SECRET_KEY)
        res.send(token).status(200)
    } catch (error) {
        console.error(error)
    }
})

//Route to Login
router.post('/login', async(req, res)=>{
    const {error} = LoginUser(req.body)
    if (error){
        return res.status(400).json(error.details[0].message)
    }

    const { email, password} = req.body;
    const new_user = await pool.query('SELECT * FROM "user" WHERE email = $1', [email])

    if(!new_user.rows[0]){
        return res.send('Invalid Login Parameters')
    }
    
    const user_password = new_user.rows[0].password
    const login = await bcrypt.compare(password, user_password)
    if (login === false){
        return res.send('Invalid Login Parameters')
    }
    const payload = {
        id: new_user.rows[0].id,
        email : email
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY)
    res.send(token).status(200)
})

module.exports = router