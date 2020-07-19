const Category=require('../models/category')
const category = require('../models/category')

exports.create=(req,res)=>{
    const category=new Category(req.body)
    category.author=req.params.userId
    category.save((err,data)=>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        res.json({data})
    })
}

exports.showCategory=(req,res)=>{
    return res.json(
        req.category
    )
}


exports.updateCategory=(req,res)=>{
    const category=req.category
    category.name=req.body.name
    category.save((err,category1)=>{
        if(err || !category1){
           return res.status(400).json({
                error:err
            })
        }
        res.json(
            category1
        )
    })
}


exports.removeCategory=(req,res)=>{
    const category=req.category
    category.remove((err,category)=>{
        if(err || !category){
            return res.status(400).json({
                error:err
            })
        }
        res.json({
            message:"Successfully remove category!"
        })
    })
}


exports.listCategories=(req,res)=>{
    Category.find().exec((err,categories)=>{
        if(err || !categories){
            return res.status(400).json({
                error:"something went wrong"
            })
        }
        res.json(
            categories
        )
    })
}

exports.categoryById=(req,res,next,id)=>{
    Category.findById(id).exec((err,category)=>{
        if(err || !category){
            res.status(400).json({
                error:"Category not found!"
            })
        }
        req.category=category
        next()
    })
}