import mongoose, { Schema } from "mongoose";

const docSchema = new Schema({
    docType: { type: String },
    docUrl: { type: String },
    verified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date }
}, { _id: false });

const approvalSchema = new Schema({
    isApproved: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectionReason: { type: String },
    rejectedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { _id: false });

const addressSchema = new Schema({
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    pincode: { type: Number, required: true },
    country: { type: String, default: "India" }
}, { _id: false });

const distributorProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    businessName: {
        type: String,
       
        trim: true,
         required: function() {
        return this.status === "approved";
    }
    },

    gstNumber: {
        type: String,
        trim: true,
        unique: true,
        set: v => v?.toUpperCase(),
        match: [
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
            "Invalid GST number"
        ],
         required: function() {
        return this.status === "approved";
    }
    },

    businessEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    businessPhone: {
        type: String,
        validate: {
            validator: v => !v || /^[0-9]{10}$/.test(v),
            message: "Phone must be 10 digits!"
        }
    },

    businessAddress: {type: addressSchema,
    required: function() {
        return this.status === "approved";
    },
},
    documents: [docSchema],

    approval: {
        type: approvalSchema,
        default: () => ({})
    },

    isActive: { type: Boolean, default: true },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }

}, { timestamps: true });

export const DistributorProfile =
    mongoose.models.DistributorProfile ||
    mongoose.model("DistributorProfile", distributorProfileSchema);
