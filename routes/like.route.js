const express = require('express')
const router = express.Router()
const pool = require('../db')
const authenticateToken = require('../middleware/auth')


//Route to like or unlike a post 
router.post('/posts/:id/like',authenticateToken, async(req,res)=>{
    const post_id = req.params.id
    const user_id = req.user.id
    try {
        const alreadyLiked = await pool.query('SELECT * FROM likes WHERE user_id = $1 AND post_id = $2',[user_id, post_id]);
      
        if (alreadyLiked.rowCount > 0) {
            const delete_like= await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2',[user_id, post_id])
            return res.status(200).send('You have unliked this post')
        }

        const new_like = await pool.query('INSERT INTO likes(user_id,post_id) values($1,$2) RETURNING *',[user_id,post_id])
    
        const all_likes =  await pool.query('SELECT * FROM likes WHERE post_id = $1', [post_id])

        const update_likes = await pool.query('UPDATE post SET likes = $1 WHERE id = $2 RETURNING *',[all_likes.rowCount,post_id])
        res.status(200).send('You have liked this post')
    } catch (error) {
        res.send(error)
    }
})

module.exports = router