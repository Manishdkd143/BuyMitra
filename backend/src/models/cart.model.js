import mongoose, { Schema } from "mongoose";
const itemsSchema=new Schema({
    productId:{
        type:String,
    },
    quantity:{
        type:Number,
    },
    price:{
        type:Number,
    }
})
const cartSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    items:[itemsSchema],
    totalPrice:{
        type:Number,
    },
},{
    timestamps:true
})
export const Cart=mongoose.model("Cart",cartSchema);
