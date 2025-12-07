import mongoose, { Schema } from "mongoose";

const paymentSchema=new Schema({
    orderId:{
        type:String,
        required:true,
    },
    paymentId:{
  type:String,
  required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        enum:["pending","success","failed","refunded"],
        required:true,
    },
    paymentMode:{
        type:String,
        required:true,
    },
    signature:String,



},{timestamps:true})
export const Payment=mongoose.models.Payment||mongoose.model("Payment",paymentSchema);