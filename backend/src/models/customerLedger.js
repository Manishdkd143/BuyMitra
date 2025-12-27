import mongoose, { Schema } from "mongoose";

const customerLedgerSchema = new Schema(
  {
    distributorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: String,

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },

    paymentMethod: String,

    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const CustomerLedger =
  mongoose.models.CustomerLedger ||
  mongoose.model("CustomerLedger", customerLedgerSchema);
