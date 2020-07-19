const express=require('express')
const router=express.Router()

const {create,showCategory,removeCategory,updateCategory,listCategories,categoryById}=require('../controllers/category')
const {requireSignin,isAuth,isAdmin}=require('../controllers/auth')
const {userById}=require('../controllers/user')
const category = require('../models/category')

router.post('/category/create/:userId',requireSignin,isAuth,isAdmin,create)
router.get('/category/:categoryId',showCategory)
router.delete('/category/:categoryId/:userId',requireSignin,isAuth,isAdmin,removeCategory)
router.put('/category/:categoryId/:userId',requireSignin,isAuth,isAdmin,updateCategory)
router.get('/categories',listCategories)

router.param('userId',userById)
router.param('categoryId',categoryById)
module.exports=router