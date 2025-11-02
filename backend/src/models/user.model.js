import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
const addressSchema=new Schema({
    street:{
        type:String,
        trim:true,
    },
    city:{
        type:String,
        trim:true,
    },
    state:{
        type:String,
        trim:true,
    },
    pincode:{
        type:String,
        trim:true,
    },
    country:{
  type:String,
  default:"INDIA"
    }
})
const docSchema=new Schema({
   docType:{type:String,required:true},
   docUrl:{type:String,required:true},
   verified:{type:Boolean,default:false},
})
const approvalSchema=new Schema({
    isApproval:{
        type:Boolean,
        default:false,
    },
    approvalBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    approvalDate:{
        type:Date,
    },
    rejection:{
        type:String,
    }
})
const userSchema=new Schema({
    name:{
        type:String,
        required:[true,"name is required!"],
    },
    email:{
        type:String,
        required:[true,"email is required!"],
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
    required:[true,"password is required!"],
    },
    phone:{
        type:Number,
        minLength:10,
    },
    role:{
        type:String,
        enum:['admin','distributor','retailer'],
        default:'retailer',
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    status:{
        type:String,
        enum:['active','suspended','pending'],
        default:'active',
    },
    address:addressSchema,
    profilePic:{
        type:String,
        default:function(){
            const seed=this.name||this.email||"guest";
            return  `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
        }
    },
    gender:{
        type:String,
        enum:["male","female","other"],
        required:true,
    },
    companyName:{type:String,trim:true},
    gstNumber:{type:String,trim:true},
    kycDoc:[docSchema],
    approvedByAdmin:approvalSchema,
 refreshToken:{type:String},
 resetPasswordToken:{type:String},
 resetPasswordExpire:{type:Date},
 lastPasswordChangeAt:{type:Date},
 lastLogin:{type:Date},
},{timestamps:true})
userSchema.pre("save",async function(next){
if(!this.isModified("password"))return next();
this.password=await bcrypt.hash(this.password,10);
next()
})
userSchema.methods.isPasswordCorrect=async function (password) {
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
    name:this.name,
    email:this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
    }
)

}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
    },
)
}
userSchema.index({name:"text",email:"text",phone:"text"})
userSchema.index({role:1})
userSchema.index({createdAt:-1})
const User=mongoose.models.User||mongoose.model('User',userSchema);
export {User}