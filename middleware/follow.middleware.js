function verifyUser(req,res,next){
    const user = parseInt(req.user.id)
    const profile = parseInt(req.params.id)

    if(user === profile){
        return res.status(404).send('You Cant Follow Yourself') 
    }
    next()
}

module.exports= verifyUser