const express = require('express')
const router = express.Router()
const pool = require('../db')
const authenticateToken = require('../middleware/auth')


//Route to create a new comment 
router.post('/posts/:id/comment',authenticateToken, async(req,res)=>{
    const post_id = req.params.id
    const user_id = req.user.id
    const {text} = req.body
    try {
        const new_comment = await pool.query('INSERT INTO comment(user_id,post_id,text) values($1,$2,$3) RETURNING *',[user_id,post_id,text])
    
        const all_comment =  await pool.query('SELECT * FROM comment WHERE post_id = $1', [post_id])

        const update_comment = await pool.query('UPDATE post SET comments = $1 WHERE id = $2 RETURNING *',[all_comment.rowCount,post_id])
        res.send(new_comment.rows)
    } catch (error) {
        res.send(error)
    }
})


//Route to delete a comment
router.delete('/posts/:id/comment/:comment_id',authenticateToken, async(req, res)=>{
    try {
        const comment_id =req.params.comment_id
        const post_id = req.params.id

        const get_comment = await pool.query('SELECT * FROM comment WHERE id = $1', [comment_id])
        if (req.user.id != get_comment.rows[0].user_id){
            return res.status(404).send('You are not authorised to do this')
        }
        
        const delete_post= await pool.query('DELETE FROM comment WHERE id =$1', [comment_id])

        const all_comment =  await pool.query('SELECT * FROM comment WHERE post_id = $1', [post_id])

        const update_comment = await pool.query('UPDATE post SET comments = $1 WHERE id = $2 RETURNING *',[all_comment.rowCount,post_id])

        res.send('Comment deleted successfully')
    } catch (error) {
        res.send(error)
    }
})

module.exports = router