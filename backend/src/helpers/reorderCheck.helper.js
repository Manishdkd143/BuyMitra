import { Inventory } from "../models/inventory.model.js";

export const checkReorderNeeded=async({distributorId,productId,orderedQty})=>{
const inventory=await Inventory.findOne({
    distributorId,
    productId
})
if(!inventory) return null;

if(inventory.quantity<=inventory.reorderLevel){
    return {
  reorderNeeded: true,
      productId,
      currentStock: inventory.quantity,
      reorderLevel: inventory.reorderLevel
    }
}
return {
    reorderNeeded: false,
    productId,
    currentStock: inventory.quantity
  };
}
