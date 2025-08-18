import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true },
  producerAddress: { type: String, required: true },
  harvestDate: { type: String, required: true },
  packagingDate: { type: String, required: true },
  expiryDate: { type: String, required: true },
  productId: { type: Number, required: true },
  qrCode: { type: String, required: true }, // DataURL of QR code
  txHash: { type: String, required: true },
  url: { type: String, required: true }
}, { timestamps: true });



export default mongoose.model("Product", ProductSchema);
