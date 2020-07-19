const express=require('express')
const router=express.Router()


const {checkToken,signup,signin,signout,requireSignin,confirm,forgot,activateAccount,isAuth}=require('../controllers/auth')
const {userSignupValidator}=require('../validator/index')


router.get('/signout',signout)
router.post('/signup',userSignupValidator,signup)
router.post('/signin',signin)
router.put('/email-activate',activateAccount)
router.post('/forgotPassword',forgot)
router.post('/confirmOTP/:email',confirm)
module.exports=router
