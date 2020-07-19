const Product=require('../models/product')
const formidable=require('formidable')
const lodash=require('lodash')
const fs=require('fs')
const product = require('../models/product')


exports.create=(req,res)=>{
    let form=new formidable.IncomingForm()
    form.keepExtensions=true
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            })
        }
        

        let product =new Product(fields)

        if(files.photo){
            if(files.photo.size>1000000){
                return res.status(400).json({
                    error:'Image could not be uploaded, Size greater than 1MB'
                })
            }
            product.photo.data=fs.readFileSync(files.photo.path)
            product.photo.contentType=files.photo.type
        }
        product.save((err,result)=>{
            if(err){
                return res.status(400).json({
                    error:"Something went wrong"
                })
            }
            res.json(result)
        })

    })
}

exports.showProduct=(req,res)=>{
    req.product.photo=undefined
    return res.json(
        req.product
    )
}

exports.relatedProducts=(req,res)=>{
    let limit=req.query.limit ? parseInt(req.query.limit):6

    Product.find({_id:{$ne:req.product}, category:req.product.category})
    .limit(limit)
    .populate('category','_id name')
    .exec((err,product)=>{
        if(err || !product){
            res.status(400).json({
                error:err
            })
        }
        res.json(
            product
        )
    })
}

exports.listProducts=(req,res)=>{
    let order=req.query.order ? req.query.order:'asc'
    let sortBy=req.query.sortBy ?req.query.sortBy:'_id'
    let limit=req.query.limit?parseInt(req.query.limit):6

    Product.find()
    .select("-photo")
    .populate('category')
    .sort([[sortBy,order]])
    .limit(limit)
    .exec((err,product)=>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        res.json(
            product
        )
    })
    
    

}

exports.deleteProduct=(req,res)=>{
    const id=req.params.productId
    Product.findByIdAndDelete(id,(err,product)=>{
        if(err || !product){
            return res.status(400).json({
                error:"Product not found"
            })
        }
        res.json({
            message:"Deleted successfully"
        })
    })
}

exports.updateProduct=(req,res)=>{
    const id=req.params.id
    console.log(id)
        let form=new formidable.IncomingForm()
    form.keepExtensions=true
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            })
        }
        

        let product =Product.findOne(id,(err,product)=>{
            if(err || !product){
                return res.status(400).json({
                    error:"Product not found"
                })
            }
        
        console.log(product)
        product=lodash.extend(product,fields)
        console.log(product)
        
        if(files.photo){
            if(files.photo.size>1000000){
                return res.status(400).json({
                    error:'Image could not be uploaded, Size greater than 1MB'
                })
            }
            product.photo.data=fs.readFileSync(files.photo.path)
            product.photo.contentType=files.photo.type
        }
        product.save((err,result)=>{
            if(err){
                return res.status(400).json({
                    error:err
                })
            }
            res.json(result)
        })
        })

    })



}

exports.productById=(req,res,next,id)=>{
    Product.findById(id)
    .populate('category')
    .exec((err,product)=>{
        if(err || !product){
            return res.status(400).json({
                error:"Product not found !!"
            })
        }
        req.product=product
        next()
    })
}


exports.listCategories=(req,res)=>{
    Product.distinct("category",{},(err,categories)=>{
        if(err){
            return res.status(400).json({
                error:"products not found"
            })
           
        }
        res.json(categories)
    })
}


exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
    };

    exports.photo=(req,res)=>{
        if(req.product.photo.data){
            res.set('Content-Type',req.product.photo.contentType)
            return res.send(req.product.photo.data)
        }
        next()
    }


    exports.listSearch=(req,res)=>{
        const query={}
        if(req.query.search){
            query.name={$regex:req.query.search,$options:'i'}
            if(req.query.category && req.query.category!=="All"){
                query.category=req.query.category
            }
            Product.find(query,(err,products)=>{
                if(err){
                    return res.status(400).json({
                        error:"Not found"
                    })
                }
                res.json(products)
            }).select('-photo')
        }
    }

    exports.updateQuantity=(req,res,next)=>{
        let bulkOps=req.body.order.products.map((item)=>{
            return{
                updateOne:{
                    filter:{_id:item._id},
                    update:{$inc:{quantity: -item.count,sold: +item.count}}
                }
            }
        })
        Product.bulkWrite(bulkOps,{},(error,product)=>{
            if(error){
                return res.status(400).json({
                    error:"could not update product"
                })
            }
            next();
        })
    }