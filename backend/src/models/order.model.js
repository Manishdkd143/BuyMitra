import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Distributor (wholesale supplier - jo bech raha hai)
  distributorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  // User/Retailer (customer - jo kharid raha hai)
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  
  // Products array
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  
  totalAmount: {
    type: Number,
    required: true,
  },
  
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
    required: true,
  },
  
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid", "partially_paid", "refunded"],
    default: "unpaid",
  },
  
  paymentMethod: {
    type: String,
    enum: ["cod", "online", "credit", "bank_transfer"],
    default: "cod",
  },
  
  paymentInfo: {
    type: Schema.Types.ObjectId,
    ref: "Payment"
  },
  
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  
  orderNotes: String,
  trackingNumber: String,
  
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
}, { timestamps: true });
orderSchema.pre('save',function(next){

})
export const Order = mongoose.models.Order|| mongoose.model("Order", orderSchema);
