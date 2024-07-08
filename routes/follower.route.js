const express = require('express')
const router = express.Router()
const pool = require('../db')
const authenticateToken = require('../middleware/auth')


//Route to like or unlike a post 
router.post('/profile/:id',authenticateToken, async(req,res)=>{
    const user_id = req.user.id
    const profile_id = req.params.id
    try {
        const alreadyFollowing = await pool.query('SELECT * FROM follower WHERE following = $1 AND follower = $2',[user_id, profile_id]);
      
        if (alreadyFollowing.rowCount > 0) {
            const delete_follow  = await pool.query('DELETE FROM follower WHERE following = $1 AND follower = $2',[user_id, profile_id])
            return res.status(200).send('You have unfollowed this profile')
        }

        const new_follow = await pool.query('INSERT INTO follower(follower,following) values($1,$2) RETURNING *',[user_id,profile_id])
    
        res.status(200).send('You have followed this profile')
    } catch (error) {
        res.send(error)
    }
})

module.exports = router