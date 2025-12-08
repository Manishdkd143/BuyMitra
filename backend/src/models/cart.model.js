import mongoose, { Schema } from "mongoose";

const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0, // % discount or flat (depends on logic)
  },
  subTotal: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},

  items: {
    type: [CartItemSchema],
    default: [],
  },
  itemsTotal: {
    type: Number,
    default: 0,      // sum of all item subTotals
  },
  coupon: {
    code: { type: String, default: null },
    discountAmount: { type: Number, default: 0 },
  },
  tax: {
    type: Number,
    default: 0,
  },
  shippingCharge: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },

}, { timestamps: true });


// =================== PRE-SAVE CALCULATION ======================
cartSchema.pre("save", function (next) {
  let subtotal = 0;

  if (!this.items || this.items.length === 0) {
    this.itemsTotal = 0;
    this.grandTotal = 0;
    this.shippingCharge = 0;
    this.tax = 0;
    this.lastUpdated = new Date();
    return next();
  }

  this.items = this.items.map((item) => {
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);
    const itemTotal = qty * price;
    item.subTotal = itemTotal;
    subtotal += itemTotal;
    return item;
  });

  this.itemsTotal = subtotal;

  // APPLY COUPON
  let afterCoupon = subtotal - (this?.coupon?.discountAmount || 0);

  // ADD TAX, SHIPPING
  this.grandTotal = Math.max(0, afterCoupon + this.tax + this.shippingCharge);

  this.lastUpdated = new Date();
  next();
});

export const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
