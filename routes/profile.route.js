const express = require('express')
const router = express.Router()
const pool = require('../db')
const authenticateToken = require('../middleware/auth')
const verifyUser = require('../middleware/follow.middleware')


//Route to see current user's profile
router.get('/profile',authenticateToken, async(req,res)=>{
    const profile_id = req.user.id

    const followerCount =  await pool.query('SELECT * FROM follower WHERE follower = $1', [profile_id])

    const followingCount =  await pool.query('SELECT * FROM follower WHERE following = $1', [profile_id])

    const follower = parseInt(followerCount.rowCount);
    const following = parseInt(followingCount.rowCount);

    const update_profile = await pool.query('UPDATE "user" SET followers = $1, following = $2 WHERE id = $3 RETURNING *',[following,follower, profile_id])

    const profile_user = await pool.query('SELECT * FROM "user" WHERE id =  $1',[profile_id])
    res.send(profile_user.rows[0])
})

//Route to see the current users following list
router.get('/profile/following',authenticateToken, async(req,res)=>{
    const profile_id = req.user.id

    const followerCount =  await pool.query('SELECT u.username FROM follower f INNER JOIN "user" u ON f.following=u.id WHERE f.follower = $1', [profile_id])

    res.send({Following : followerCount.rows})
})

//Route to see the current users follower list
router.get('/profile/follower',authenticateToken, async(req,res)=>{
    const profile_id = req.user.id

    const followingCount =   await pool.query('SELECT u.username FROM follower f INNER JOIN "user" u ON f.follower=u.id WHERE f.following = $1', [profile_id])

    res.send({Followers : followingCount.rows})
})

//Route to see other user's profile
router.get('/profile/:id',authenticateToken, async(req,res)=>{
    const profile_id = req.params.id

    const followerCount =  await pool.query('SELECT * FROM follower WHERE follower = $1', [profile_id])

    const followingCount =  await pool.query('SELECT * FROM follower WHERE following = $1', [profile_id])

    const follower = parseInt(followerCount.rowCount);
    const following = parseInt(followingCount.rowCount);

    const update_profile = await pool.query('UPDATE "user" SET followers = $1, following = $2 WHERE id = $3 RETURNING *',[following,follower, profile_id])

    const profile_user = await pool.query('SELECT * FROM "user" WHERE id =  $1',[profile_id])
    res.send(profile_user.rows[0])
})

//Route to follow or unfollow a profile 
router.post('/profile/:id',[authenticateToken, verifyUser], async(req,res)=>{
    const user_id = req.user.id
    const profile_id = req.params.id

    if (profile_id === user_id){
        return res.status(400).send("you cant follow yourself")
    }

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

//Route to see the other users following list
router.get('/profile/:id/following',authenticateToken, async(req,res)=>{
    const profile_id = req.params.id

    const followerCount =  await pool.query('SELECT u.username FROM follower f INNER JOIN "user" u ON f.following=u.id WHERE f.follower = $1', [profile_id])

    res.send({Following : followerCount.rows})
})

//Route to see the other users follower list
router.get('/profile/:id/follower',authenticateToken, async(req,res)=>{
    const profile_id = req.params.id

    const followingCount =  await pool.query('SELECT u.username FROM follower f INNER JOIN "user" u ON f.follower=u.id WHERE f.following = $1', [profile_id])

    res.send({Following : followingCount.rows})
})

module.exports = router