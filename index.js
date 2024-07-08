const express = require('express')
const app = express()
const authRouter = require('./routes/auth.route')
const postRouter = require('./routes/post.route')
const commentRouter = require('./routes/comment.route')
const likeRouter = require('./routes/like.route')
const profileRouter = require('./routes/profile.route')

app.use(express.json())

app.use('/auth', authRouter)
app.use('/api', [postRouter, commentRouter, likeRouter, profileRouter])

const PORT = 3000 || process.env.PORT
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})