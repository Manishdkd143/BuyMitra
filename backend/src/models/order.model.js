import mongoose, { Schema } from "mongoose";

const orderSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    products:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
    totalAmount:{
        type:Number,
    },
    paymentInfo:{
        type:Schema.Types.ObjectId,
        ref:"Payment"
    },
    shippingAddress:{
        type:String,
        enum:["Pending","Processing","Shipped","Delivered","Cancelled"],
        required:true,
    },
    deliveredAt:{
        type:Date.now()
    }
},{timestamps:true})
export const Order=mongoose.model("Order",orderSchema)