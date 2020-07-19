const mongoose=require('mongoose')
const {ObjectId}=mongoose.Schema

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        maxlength:32
    },
    price:{
        type:Number,
        required:true,
        trim:true
    },
    photo:{
        data:Buffer,
        contentType:String
    },
    description:{
        type:String,
        required:true,
        maxlength:1000
    },
    category:{
        type:ObjectId,
        ref:'Category',
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        trim:true
    },
    sold:{
        type:Number,
        default:0,
    },
    shipping:{
        type:Boolean,
        required:true,
        default:false
    }
},{timestamps:true}
)

module.exports=mongoose.model("Product",productSchema)