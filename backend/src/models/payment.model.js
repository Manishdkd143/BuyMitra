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
        enum:["Pending","Success","Failed","Refunded"],
        required:true,
    },
    method:{
        type:String,
        required:true,
    },
    currency:{
        type:String,
        default:"INR"
    },

},{timestamps:true})
export const Payment=mongoose.model("Payment",paymentSchema)