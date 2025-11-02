import { Schema } from "mongoose";

const distributorProfileSchema=new Schema({
    name:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,
    },
    businessName: {
    type: String,
    required: true,
    trim: true
  },
  gstNumber:{
    type:String,
    trim:true,
  },
  bussinessEmail:{
    type:String,
    trim:true,
  },
  bussinessPhone:{
    type:String,
    trim:true,
  },
  address:{
    city:String,
    state:String,
    pincode:Number,
    country:{
        type:String,
        default:"India",
    },

  },
  documents:{
    gstCertificate:String,
    bussinessLicence:String,
  },
  verifiedByAdmin:{
    type:String,
    default:false,
  },

},{timestamps:true})