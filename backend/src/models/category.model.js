import mongoose,{Schema} from "mongoose";
const categorySchema=new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    slug:{type:String},
    description:{type:String},
    image:{
        type:String,
    }
},{timestamps:true})
const Category=mongoose.model("Category",categorySchema);
export  {Category};