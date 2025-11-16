import mongoose,{Schema} from "mongoose";
const CartItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0 // percentage or flat, depending on logic
  },
  subTotal: {
    type: Number,
    default:0,
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: {
    type: [CartItemSchema],
    default: []
  },
  itemsTotal: {
    type: Number,
    default: 0 // sum of all item totals
  },
  coupon: {
    code: String,
    discountAmount: Number
  },
  Tax:{
    type:Number,
   default:0,
  },
  discount:{
    type:Number,
    default:0,
  },
  grandTotal: {
    type: Number
  },
  shippingCharge:{
    type:Number,
    default:0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now(),
  }
}, { timestamps: true });
cartSchema.pre('save',function(next){
    let subtotal=0;
    if(!this.items||this.items.length===0){
      this.subtotal=0;
      this.grandTotal=0;
      this.lastUpdated=new Date()
      return next()
    }
        this.items = this.items.map(item => {
    const qty = Number(item.qty || 0);
    const price = Number(item.price || 0);
    const itemTotal = qty * price;

    item.subTotal = itemTotal;
    subtotal += itemTotal;
    return item;
  });
  this.itemsTotal=subtotal;
  if(this.coupon&&this.coupon.discountAmount){
    this.grandTotal=Math.max(0,subtotal-this.coupon.discountAmount)
  }else{
    this.grandTotal=subtotal
  }
    this.lastUpdated=new Date();
    next();
})
export const Cart=mongoose.models.Cart||mongoose.model("Cart",cartSchema);
