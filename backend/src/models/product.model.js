
import {mongoose,Schema} from "mongoose";
const productSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String,  lowercase: true },
  sku: { type: String, unique: true, required: true },

  description: String,
  price: { type: Number, required: true },
  wholesalePrice: Number,
  discount: Number,
  gst: { type: Number, default: 18 },

  images: [String],
  thumbnail: String,

  brand: String,
  unit: { type: String,
    enum:["piece","kg","litre","box","packet"],
     default: "piece" },
  weight: Number,
 unitsPerBase:{
 type:Number,
 default:1//piece to piece
 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

  status: { type: String, enum: ["active", "inactive"], default: "active" },

  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);