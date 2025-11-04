import mongoose, { Schema } from "mongoose";

const productSchema=new Schema({
    name:{
        type:String,
        required:[true,"Product name is required!"],
        trim:true,
    },
    slug:{
     type:String,
     unique:true,
     lowercase:true,
    },
     sku:{
   type:String,
   unique:true,
   trim:true,
   required:true,
   uppercase:true,
     },
    description:{
        type:String,
    },

    //price-->
    price:{
        type:Number,
        required:true,
    },
    wholesalePrice:{
        type:Number,
    },
    discount:{
        type:Number,
    },
   gst:{
    type:Number,
    default:18
   },

//inventory
    stock:{
        type:Number,
        required:true,
    },
    minOrderQty:{
        type:Number,
        default:0
    },
    maxOrderQty:{
     type:Number,
    },
    lowStockAlert:{
     type:Number,
     default:10,
    },

    images:[
       { type:String},
    ],
    thumbnail:{
        type:String,
    },
   //product details
    brand:{
        type:String,
    },
    unit:{
        type:String,
        default:'piece',
    },
    weight:{
        type:Number,
    },

    category:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:[true,"category is required!"],
    },
    status:{
      type:String,
      enum:["active","inactive","out_of_stock"],
      default:"active",
    },

    createdBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    updatedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    isVerified:{
        type:Boolean,
        default:false,
    }
},{timestamps:true})

productSchema.index({category:1,status:1})
productSchema.index({createdAt:1});
productSchema.index({description:"text",name:"text"})
productSchema.pre("save",function(next){
   if(this.isModified("name")&&!this.slug){
     this.slug=this.name.toLowerCase().replace('/[^a-z0-9]+/g',"-").replace("/^-|-$/g",'')?.trim();
   }
   next()
})
export const Product=mongoose.model("Product",productSchema)