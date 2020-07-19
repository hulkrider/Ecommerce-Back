const express=require('express')
const router=express.Router()

const {userById,deleteUser,updateUser,getUser,purchaseHistory}=require('../controllers/user')
const {requireSignin,isAuth,isAdmin}=require('../controllers/auth')

router.get('/secret/:userId',requireSignin,isAuth,(req,res)=>{
    res.json({
        user:req.profile
    })
})

router.get('/user/:userId',requireSignin,isAuth,getUser)
router.put('/user/:userId',requireSignin,isAuth,updateUser)
router.delete('/user/:userId',requireSignin,isAuth,deleteUser)
router.get('/orders/by/user/:userId',requireSignin,isAuth,purchaseHistory)

router.param('userId',userById)

module.exports=router