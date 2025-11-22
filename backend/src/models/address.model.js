import mongoose from "mongoose";
import { Schema } from "mongoose";

const addressSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    fullName: {
        type: String,
        set: (val) => val?.replace(/\s+/g, ''),
        required: [true, "Full name is required"],
        trim: true,
        minlength: [3, "Full name must be at least 3 characters"],
        maxlength: [100, "Full name must not exceed 100 characters"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: "Phone number must be exactly 10 digits"
        }
    },
    anotherPhone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || /^[0-9]{10}$/.test(v);
            },
            message: "Alternate phone number must be exactly 10 digits"
        }
    },
    addressLine1: {
        type: String,
        required: [true, "Address line 1 is required"],
        trim: true,
        minlength: [5, "Address must be at least 5 characters"],
        maxlength: [200, "Address must not exceed 200 characters"]
    },
    addressLine2: {
        type: String,
        trim: true,
        maxlength: [200, "Address must not exceed 200 characters"]
    },
    city: {
        type: String,
        set: (val) => val?.replace(/\s+/g, ''),
        required: [true, "City is required"],
        trim: true,
        minlength: [2, "City name must be at least 2 characters"],
        maxlength: [50, "City name must not exceed 50 characters"]
    },
    state: {
        type: String,
        set: (val) => val?.replace(/\s+/g, ''),
        required: [true, "State is required"],
        trim: true,
        minlength: [2, "State name must be at least 2 characters"],
        maxlength: [50, "State name must not exceed 50 characters"]
    },
    pincode: {
        type: String,
        required: [true, "Pincode is required"],
        trim: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{6}$/.test(v);
            },
            message: "Pincode must be exactly 6 digits"
        }
    },
    country: {
        type: String,
        required: true,
        trim: true,
        default: "India"
    },
    addressType: {
        type: String,
        default: "Home",
        enum: {
            values: ["Home", "Office", "Other"],
            message: "Address type must be Home, Office, or Other"
        }
    },
    isDefault: { 
        type: Boolean,
        default: false,  
    }
}, {
    timestamps: true
});
addressSchema.index({  isDefault: 1 });
addressSchema.pre('save',async function(next){
    if(this.isDefault){
        await mongoose.model("Address").updateMany({
            userId:this.userId,
            _id:this._id,
            isDefault:true,
        },
    {
        isDefault:false,
    })
    }
    next();
});
export const Address=mongoose.models.Address||mongoose.model("Address",addressSchema)