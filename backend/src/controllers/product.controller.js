import { Product } from "../models/product.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import fs from "fs";
import uploadFileOnCloud from "../utils/Cloudinary";
const createProduct = asyncHandler(async (req, res) => {
  const isLoggedUser = req?.user;
  if (isLoggedUser.role === "retailer") {
    req.files.forEach((file) => fs.unlinkSync(file.path));
    throw new ApiError(400, "Retailer not allowed!");
  }
  const {
    title,
    description,
    price,
    wholesalePrice,
    discount,
    sku,
    stock,
    category,
    createdBy,
    status,
  } = req.body;
  if (
    [
      title,
      description,
      price,
      wholesalePrice,
      sku,
      discount,
      stock,
      category,
    ].some((field) => !field || field === "")
  ) {
    if (!req.files && req.files.length === 0) {
      req.files.forEach((file) => fs.unlinkSync(file.path));
    }
    throw new ApiError(400, "All fields required!");
  }
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Minimum one image is required!");
  }
  const imagesPathLocal = req.files.map((file) => file.path);
  const uploadPromise=imagesPathLocal.map(async(pathUrl)=>{
   const cloudUrl=await uploadFileOnCloud(pathUrl)
   if(fs.existsSync(pathUrl)){
      fs.unlinkSync(pathUrl)
   }
   return cloudUrl;
  })
  const imagesPath=await Promise.all(uploadPromise);
  
  if(!imagesPath||imagesPath.length===0){
   throw new ApiError(402,"file uploaded failed!")
  }
const validImages=imagesPath.filter((url)=>url)
if(validImages.length===0){
   throw new ApiError(400,"All file upload failed!")
}
  const newProduct = await Product.create({
    title: title.trim().toLowerCase(),
    description: description.trim(),
    sku: sku.trim().toUpperCase(),
    price: Number(price),
    wholesalePrice: Number(wholesalePrice),
    discount: Number(discount) || 0,
    gst: Number(gst) || 0,
    stock: Number(stock) || 0,
    minOrderQty: Number(minOrderQty) || 1,
    maxOrderQty: Number(maxOrderQty) || null,
    lowStockAlert: Number(lowStockAlert) || 10,
    images: validImages,
    thumbnail: validImages[0],
    unit: unit?.trim().toLowerCase() || "piece",
    status: status || "active",
    brand: brand?.trim().toLowerCase() || null,
    weight: weight || null,
    category: category?.trim().toLowerCase(),
    createdBy: req.user?._id,
  });
  if (!newProduct) {
    imagesPath.forEach((path) => fs.unlinkSync(path));
    throw new ApiError(500, "Product could not be created!");
  }
  res
    .status(201)
    .json(new ApiResponse(201, newProduct, "Product added successfully"));
});
const updateProductdetails = asyncHandler(async (req, res) => {
  const isLoggedUser = req?.user;

  if (!isLoggedUser) {
    throw new ApiError(401, "Unauthorized user!");
  }
  if (isLoggedUser?.role?.trim().toLowerCase() === "retailer") {
    throw new ApiError(401, "Retailer not allowed!");
  }
  const {productId}=req.params
  if (!productId) {
    throw new ApiError(404, "product id required!");
  }
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "product not exists!");
  }
  const {
    title,
    description,
    price,
    wholesalePrice,
    discount,
    sku,
    stock,
    category,
    gst,
    minOrderQty,
    maxOrderQty,
    lowStockAlert,
    unit,
    status,
    brand,
    weight,
  } = req.body;
  const updateField={}
  if(title&&title?.trim()!==""){
   updateField.title=title.trim().toLowerCase();
  }
  if(description&&description?.trim()!==""){
   updateField.description=description.trim();
  }
  if(price!==undefined){
   updateField.price=Number(price);
  }
  if(wholesalePrice!==undefined){
   updateField.wholesalePrice=Number(wholesalePrice)
  }
  if(discount!==undefined){
   updateField.discount=Number(discount)
  }
  if(sku&&sku?.trim()!==""){
   const skuUpper=sku.trim().toUpperCase();
   const skuExists=await Product.findOne({sku:skuUpper,_id:{$ne:product._id}})
   if(skuExists){
      throw new ApiError(409,"Product with this sku already exists!")
   }
   updateField.sku=skuUpper
  }
  if(stock!==undefined){
   updateField.stock=Number(stock)
  }
  if(minOrderQty!==undefined){
   updateField.minOrderQty=Number(minOrderQty)
  }
  if(category&&category?.trim()!==""){
   updateField.category=category
  }
  if(gst!==undefined){
   updateField.gst=Number(gst)
  }
  if(maxOrderQty!==undefined){
   updateField.maxOrderQty=Number(maxOrderQty)
  }
  if(lowStockAlert!==undefined){
   updateField.lowStockAlert=Number(lowStockAlert)
  }
  if(unit&&unit?.trim()!==""){
   updateField.unit=unit.trim().toLowerCase()
  }
  if(status&&status?.trim()!==""){
   updateField.status=status.trim().toLowerCase()
  }
  if(brand&&brand?.trim()!==""){
    updateField.brand=brand.trim().toLowerCase();
  }
  if(weight!==undefined){
  updateField.weight=Number(weight)
  }
  updateField.updatedBy=isLoggedUser?._id;
  updateField.updatedAt=Date.now()
  if(Object.keys(updateField).length===2){
   throw new ApiError(500,"At least one field to updated!")
  }
  const updatedProduct=await Product.findByIdAndUpdate(product._id,{
   $set:updateField
  },
{new:true},
)
if(!updatedProduct){
   throw new ApiError(500,"product updated failed!")
}
return res.status(200).json(new ApiResponse(200,updatedProduct,"Product details updated successfully"))
});
const updateProdImages=asyncHandler(async(req,res)=>{
   const isLoggedUser=req?.user;
   const {productId}=req.params
   if(!isLoggedUser){
      req.files.forEach((file)=>fs.unlinkSync(file.path))
      throw new ApiError(401,"Unauthorized user!please login")
   }
   if(!productId){
      throw new ApiError(400,"Product id required!")
   }
   const imagesPathLocal=req.files.map(file=>file.path);
   if(!imagesPathLocal&&imagesPathLocal.length===0){
      throw new ApiError(404,"images are required")
   }
   const uploadPromise=imagesPathLocal.map(async(filepath)=>{
      const cloudUrl=await uploadFileOnCloud(filepath);
      if(fs.existsSync(filepath)){
         fs.unlinkSync(filepath)
      }
      return cloudUrl
   })
   const validImages=await Promise.all(uploadPromise)
   if(validImages.length===0){
      throw new ApiError(500,"All file upload failed!")
   }
   const updatedProduct=await Product.findByIdAndUpdate({slug:slug},{
      $set:{
         images:validImages,
      },
   },{
      new:true,
   })
   if(!updatedProduct){
   throw new ApiError(500,"Images updated failed!")
   }
   return res.status(200).json(new ApiResponse(200,updatedProduct,"Images updated successfully"))
})
const removeProduct=asyncHandler(async(req,res)=>{
     const isLoggedUser = req?.user;
  if (isLoggedUser.role === "retailer") {
    throw new ApiError(400, "Retailer not allowed!");
  }
  const {productId}=req.params;
  if(!productId){
   throw new ApiError(400,"product id required!")
  }
  const deletedProduct=await Product.findByIdAndDelete(productId)
  if(!deletedProduct){
   throw new ApiError(500,"Product deletion failed!")
  }
  return res.status(200).json(new ApiResponse(200,deletedProduct,"Product deleted successfully!"))
})
const getProductByIdOrSlug=asyncHandler(async(req,res)=>{
   const {slug,productId}=req.params;
   if(!slug||!productId){
      throw new ApiError(400,"Either slug or product id is required!")
   }
   const isLoggedUser=req.user;
   if(!isLoggedUser){
      throw  new ApiError(400,"Unauthorized user!please login")
   }
 const productInfo=slug?await Product.findOne({slug:slug}).select("-lowStockQty -minOrderQty -maxOrderQty -updatedBy"):await Product.findOne({_id:productId}).select("-lowStockQty -minOrderQty -maxOrderQty -updatedBy");
 if(!productInfo){
  throw new ApiError(404,"product not exists!")
 }
   return res.status(200).json(new ApiResponse(200,productInfo,"Product details fetched successfully"))
})
const toggleVerify=asyncHandler(async(req,res)=>{
   const {productId}=req.params;
   const isLoggedUser=req?.user;
   if(isLoggedUser?.role.toLowerCase()!=="admin"&&isLoggedUser?.role.toLowerCase()!=="distributor"){
    throw new ApiError(403,"Access denied! Only Admin and Distributor allowed.")
   }
   if(!productId){
    throw new ApiError(400,"product id required!")
   }
   const productExists=await Product.findById(productId);
   if(!productExists){
    throw new ApiError(404,"product not exists!")
   }
  productExists.isVerified=!productExists.isVerified
   await productExists.save();
   return res.status(200).json(new ApiResponse(200,productExists,`${productExists.isVerified?"Product is verified":"Product is unVerified"}`))
})
const getAllProductsByUser=asyncHandler(async(req,res)=>{
  const {page=1,limit=10}=req.query;
  const skip=(parseInt(page)-1)*parseInt(limit);
  if(!req?.user){
   throw new ApiError(401,"Unauthorized user!please login")
  }
  const findField={}
  const {brand,category,isVerified}=req.query;
  if(brand) findField.brand=brand?.trim();
   if(category)findField.category=category?.trim();
   if(isVerified)findField.isVerified=isVerified===true;
  // const allProducts=await Product.find(findField,{updatedBy:0,minOrderQty:0,maxOrderQty:0,lowStockAlert:0,__v:0}).skip(skip).limit(limit).sort({createdAt:-1})
 const allProducts= await Product.aggregate([
    {
      $match:findField
    },
    {
      $project:{
        minOrderQty:0,
        maxOrderQty:0,
        lowStockAlert:0,
        updatedBy:0,
      }
    },
    {
      $facet:{
        metadata:[{$count:"total"}],
        data:[{$skip:skip},{$limit:limit}]
      }
    }
  ])
  if(!allProducts){
    throw new ApiError(404,"Product are empty!")
  }
  const totalProducts=allProducts[0]?.metadata[0]?.total||0;
  return res.status(200).json(new ApiResponse(200,{currentPage:page,totalPage:Math.ceil(totalProducts/limit),products:allProducts[0]?.data||[]},"all products fetched successfully!"))
})
const unVerifiedUser=asyncHandler(async(req,res)=>{
    const {page=1,limit=10}=req.query;
  const skip=(parseInt(page)-1)*parseInt(limit);
  if(!req?.user){
   throw new ApiError(401,"Unauthorized user!please login")
  }
  if(req?.user?.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(500,"access-denied retailer not allowed.")
  }
   const unVerifiedProducts=await Product.aggregate([
    {
      $match:{isVerified:false}
    },
    {
      $facet:{
        metadata:[{$count:"total"}],
        data:[{$skip:skip},{$limit:parseInt(limit)}]
      }
    }
   ])
     const total = unVerifiedProducts[0]?.metadata[0]?.total || 0;
  const products = unVerifiedProducts[0]?.data || [];
    if (total === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "All products are verified!"));
  }

   return res.status(200).json(
    new ApiResponse(
      200,
      {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        products,
      },
      "All unverified products fetched successfully!"
    )
  );
})
export { createProduct,updateProductdetails,updateProdImages,removeProduct,getProductByIdOrSlug,getAllProductsByUser,toggleVerify,unVerifiedUser};
