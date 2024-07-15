const express = require('express')
const router = express.Router()
const pool = require('../db')
const authenticateToken = require('../middleware/auth')


//Route to see all posts
router.get('/posts',authenticateToken, async(req,res)=>{
    const all_posts = await pool.query('SELECT * FROM post')
    res.send(all_posts.rows)
})

//Route to see only posts from people you follow
router.get('/posts/following', authenticateToken, async(req,res)=>{
    const following_posts = await pool.query('SELECT * FROM post WHERE follower = $1', [req.user.id])
    res.send(following_posts.rows)
})

//Route to create a new post 
router.post('/posts',authenticateToken, async(req,res)=>{
    const {text} = req.body
    const new_post = await pool.query('INSERT INTO post(user_id,text) values($1,$2) RETURNING *',[req.user.id,text])
    res.send(new_post.rows)
})

//Route to see a specific post 
router.get('/posts/:id',authenticateToken, async(req,res)=>{
    const post_id =req.params.id
    const get_post = await pool.query('SELECT * FROM post WHERE id = $1', [post_id])
    const comments = await pool.query('SELECT * FROM comments WHERE post_id = $1', [post_id])
    res.send({
        'post':get_post.rows,
        'comments' : comments.rows,
    })
})

//Route to Update a post
router.put('/posts/:id',authenticateToken, async(req,res)=>{
    const post_id =req.params.id
    const get_post = await pool.query('SELECT * FROM post WHERE id = $1', [post_id])
    if (req.user.id != get_post.rows[0].user_id){
        return res.status(404).send('You are not authorised to do this')
    }

    const {text} = req.body
    const new_post = await pool.query('UPDATE post SET text =$2 WHERE id = $1 RETURNING *',[post_id,text])
    res.send(new_post.rows)
})

//Route to delete a post
router.delete('/posts/:id',authenticateToken, async(req, res)=>{
    const post_id =req.params.id
    const get_post = await pool.query('SELECT * FROM post WHERE id = $1', [post_id])
    if (req.user.id != get_post.rows[0].user_id){
        return res.status(404).send('You are not authorised to do this')
    }
    const delete_post= await pool.query('DELETE  post WHERE id =$1', [post_id])
    res.send('Post deleted successfully')
})

module.exports = router