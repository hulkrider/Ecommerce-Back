const mongoose=require('mongoose')
const {ObjectId}=mongoose.Schema

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        maxlength:32,
        unique:true
    },
    author:{
        type:ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true}
)

module.exports=mongoose.model("Category",categorySchema)