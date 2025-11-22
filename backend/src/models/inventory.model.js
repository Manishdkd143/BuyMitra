import mongoose, { Schema } from "mongoose";
const InventorySchema=new Schema({
    distributorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true,
    },
    quantity:{
        type:Number,
       required:true,
       min:0,
    }
},{
    timestamps:true,
})
const Inventory=mongoose.models.Inventory||mongoose.model("Inventory",InventorySchema);
export {Inventory}