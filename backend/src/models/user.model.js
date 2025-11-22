import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
// const approvalSchema=new Schema({
//     isApproval:{
//         type:Boolean,
//         default:false,
//     },
//     approvalBy:{
//         type:Schema.Types.ObjectId,
//         ref:"User"
//     },
//     approvalDate:{
//         type:Date,
//     },
//     rejection:{
//         type:String,
//     }
// },{_id:false})
const addressSchema = new Schema({
    street: { type: String, trim: true },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    pincode: { type: Number, required: true },
    country: { type: String, default: "India" }
}, { _id: false });

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required!"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
        minLength: [6, "Password must be at least 6 characters"],
    },
    phone: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^[0-9]{10}$/.test(v);
            },
            message: "Phone must be 10 digits!"
        }
    },
    role: {
        type: String,
        enum: ['admin', 'distributor', 'retailer'],
        default: 'retailer',
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending'],
        default: 'active',
    },
        distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // Only for retailer
    },
    address: addressSchema,
    profilePic: {
        type: String,
        default: function() {
            const seed = this.name || this.email || "guest";
            return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
        }
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    
    // Auth & Activity
    refreshToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    lastPasswordChangeAt: { type: Date },
    lastLogin: { type: Date },
}, { timestamps: true });

// Indexes
userSchema.index({ role: 1, status: 1 });
userSchema.pre("save",async function(next){
      if (!this.profilePic?.trim()) {
        const seed = this.name || this.email || "guest";
        this.profilePic = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}`;
    }
    if(this.role==="admin"){
        this.isVerified=true;
    }
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