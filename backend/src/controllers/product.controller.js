import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import fs from "fs";
import uploadFileOnCloud from "../utils/Cloudinary.js";
import csv from "csvtojson";
import deleteFileOnCloud from "../utils/deleteFileOnCloud.js";
import { ensureCategoryExists } from "../utils/category.helper.js";
import mongoose from "mongoose";
const createProduct = asyncHandler(async (req, res) => {
  const isLoggedUser = req?.user;
  if (isLoggedUser?.role?.trim()?.toLowerCase() === "retailer") {
    req.files.forEach((file) => fs.unlinkSync(file.path));
    throw new ApiError(400, "Access-denied retailer not allowed!");
  }
  const {
    name,
    description,
    price,
    wholesalePrice,
    discount,
    sku,
    stock,
    category,
    createdBy,
    gst,
    minOrderQty,
    maxOrderQty,
    lowStockAlert,
    status,
    weight,
    unit,
    brand,
  } = req.body;
  if (
    [
      name,
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
 const existingProduct= await Product.findOne({$and:[{sku:sku?.trim()?.toUpperCase()},{name:name?.trim()?.toLowerCase()}]})
 if(existingProduct){
  const imagesPathLocal = req.files?.map((file) => file.path);
 imagesPathLocal.map((pathUrl)=>{
  if(fs.existsSync(pathUrl)){
    fs.unlinkSync(pathUrl)
  }
 })
  throw new ApiError(409,"Product already exists!")
 }
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "Minimum one image is required!");
  }
  const imagesPathLocal = req.files?.map((file) => file.path);
  const uploadPromise=imagesPathLocal.map(async(pathUrl)=>{
   const cloudUrl=await uploadFileOnCloud(pathUrl)
  //  if(fs.existsSync(pathUrl)){
  //     fs.unlinkSync(pathUrl)
  //  }
   return cloudUrl;
  })
  const imagesPath=await Promise.all(uploadPromise);
  
  if(!imagesPath||imagesPath.length===0){
   throw new ApiError(402,"file uploaded failed!")
  }
const validImages=imagesPath.filter((file)=>file?.url).map((img)=>img?.url)
// console.log(validImages[0]?.url)
if(validImages.length===0){
   throw new ApiError(400,"All file upload failed!")
}
const categoryDoc=await ensureCategoryExists(category);
  const newProduct = await Product.create({
    name: name.trim().toLowerCase(),
    description: description.trim(),
    sku: sku.trim().toUpperCase(),
    price: Number(price),
    wholesalePrice: Number(wholesalePrice),
    discount: Number(discount) || 0,
    gst: Number(gst) || 18,
    stock: Number(stock) || 0,
    minOrderQty: Number(minOrderQty) || 1,
    maxOrderQty: Number(maxOrderQty) || null,
    lowStockAlert: Number(lowStockAlert) || 10,
    images: validImages,
    thumbnail: validImages[0],
    unit: unit?.trim().toLowerCase() || "piece",
    status: status || "active",
    brand: brand?.trim().toLowerCase() || null,
    weight: Number(weight) || null,
    category:categoryDoc._id,
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
    name,
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
    slug,
  } = req.body;
  const updateField={}
  if(name&&name?.trim()!==""){
   updateField.name=name.trim().toLowerCase();
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
  if(slug&&slug!==""){
    updateField.slug=slug;
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
    const product=await Product.findById(productId);
   if(!product) throw new ApiError(404,"Product not exists!")
    
    if(product.images&&product.images.length>0){
     const imagesPath=product.images.map((file)=>{
      return file
    });
     
     await deleteFileOnCloud(imagesPath)
    }
   const uploadPromise=imagesPathLocal.map(async(filepath)=>{
      const cloudUrl=await uploadFileOnCloud(filepath);
      if(fs.existsSync(filepath)){
         fs.unlinkSync(filepath)
      }
      return cloudUrl
   })
   const validImages=await Promise.all(uploadPromise)
  console.log(validImages);
  const imgUrl=validImages.forEach((img)=>img.url);
   if(validImages.length===0){
      throw new ApiError(500,"All file upload failed!")
   }
   const updatedProduct=await Product.findByIdAndUpdate(productId,{
      $set:{
         images:imgUrl,
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
  if (isLoggedUser.role?.trim().toLowerCase() === "retailer") {
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
  console.log(req.query);
  
   const {slug,productId}=req.query;
   if(!slug&&!productId){
      throw new ApiError(400,"Either slug or product id is required!")
   }
   const validSlug=slug?.replace("-"," ")?.trim()?.toLowerCase();

   const isLoggedUser=req.user;
   if(!isLoggedUser){
      throw  new ApiError(400,"Unauthorized user!please login")
   }
 const productInfo=validSlug?await Product.findOne({slug}).select("-lowStockQty -minOrderQty -maxOrderQty -updatedBy"):await Product.findOne({_id:productId}).select("-lowStockQty -minOrderQty -maxOrderQty -updatedBy");
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
const unVerifiedProducts=asyncHandler(async(req,res)=>{
    const {page=1,limit=10}=req.query;
  const skip=(Number(page)-1)*Number(limit);
  if(!req?.user){
   throw new ApiError(401,"Unauthorized user!please login")
  }
  if(req.user?.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(500,"access-denied retailer not allowed.")
  }
   const unVerified=await Product.aggregate([
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
     const total = unVerified[0]?.metadata[0]?.total || 0;
  const products = unVerified[0]?.data || [];
    if (total === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "All products are verified!"));
  }

   return res.status(200).json(
    new ApiResponse(
      200,
      {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        products,
      },
      "All unverified products fetched successfully!"
    )
  );
})
const allProductsByAdminAndDist=asyncHandler(async(req,res)=>{
  const user=req.user;
  const {page=1,limit=10,search='',brand,category}=req.query;
  const skip=(Number(page)-1)*Number(limit)
  if(!user){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(user.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(403,"access-denied retailer not allowed.")
  }
  const filterField={};
  if(search){
    filterField.$or=[
      {name:{$regex:search,$options:"i"}},
      {sku:{$regex:search,$options:"i"}},
    ]
  }
  if(category?.trim())filterField.category=category?.trim().toLowerCase();
  if(brand?.trim())filterField.brand=brand?.trim().toLowerCase();
   
  const products=await Product.aggregate([
    {$match:filterField||{}},
    {$sort:{createdAt:-1}},
    {$facet:{
      metadata:[{$count:"total"}],
      data:[{$skip:skip},{$limit:Number(limit)}]
    }},
    
  ])
  if(!products){
    throw new ApiError(404,"Products not found!")
  }
  const totalProducts=products[0]?.metadata[0]?.total||0;
  const allProducts=products[0]?.data||[];
  return res.status(200).json(new ApiResponse(200,{currentPage:Number(page),totalPage:Math.ceil(totalProducts/limit),total:totalProducts,allProducts},"Products fetched successfully!"))
})

const stockUpdate=asyncHandler(async(req,res)=>{
  const user=req?.user;
  const {productId}=req.params;
  const {stock}=req.body;
  if(!user){
    throw new ApiError(401,"Unauthorized user!please login")
  }
if(!productId){
  throw new ApiError(400,"Product id required!")
}
  if(user?.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(403,"Access-denied retailer not allowed!")
  }
  if(stock===undefined||isNaN(stock)){
    throw new ApiError(400,"Stock is required!")
  }
 const product=await Product.findByIdAndUpdate(productId,{
  $set:{
    stock:Number(stock),
    updatedBy:user?._id,
  }
 },
{new:true,runValidators:true});
if(!product){
  throw new ApiError(404,"Product not found!")
}
return res.status(200).json(new ApiResponse(200,product,"Stock is updated successfully"))
})
const lowStock=asyncHandler(async(req,res)=>{
  const user=req?.user;
  if(!user){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(user?.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(403,"Access-denied retailer not allowed!")
  }
  const lowStockProducts=await Product.aggregate([
    {
      $match:{
        $expr:{$lte:["$stock","$lowStockAlert"]}
      }
    },
    {
      $sort:{createdAt:-1}
    },
    {$project:{
       name: 1,
        sku: 1,
        brand: 1,
        category: 1,
        stock: 1,
        lowStockAlert: 1,
        createdAt: 1
    }}
  ]);
     if (!lowStockProducts || lowStockProducts.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No low-stock products found."));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { total: lowStockProducts.length, products: lowStockProducts },
      "Low-stock products fetched successfully!"
    )
  );
})
const bulkUploadProducts=asyncHandler(async(req,res)=>{
  const user=req?.user;
  if(!user){
    throw new ApiError(404,"Unauthorized user!please login")
  }
  if(!req.file){
    throw new ApiError(400,"file is required!")
  }
  const csvPath=req.file?.path
    const jsonArray=await csv().fromFile(csvPath);
    if(!jsonArray&&!jsonArray?.length){
      fs.unlinkSync(csvPath)
      throw new ApiError(400,"file conversion failed!")
    }
    const validProducts=jsonArray.filter((p)=>{
      const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
       if (!p.name || !p.slug || !p.price || !p.stock || !p.images) {
        fs.unlinkSync(csvPath)
    return false;
  }
 if(typeof p.images!=='string'){
    fs.unlinkSync(csvPath)
  return false
 }
 if(!p.images.startsWith("http://")&&!p.images.startsWith("https://")){
    fs.unlinkSync(csvPath)
  return false
 }
 const hasValidExt=validImageExtensions.some((ext)=>p.images.toLowerCase().endsWith(ext))
 if(!hasValidExt){
  return false 
 }
 return true
    })
     if (validProducts?.length===0)
     { 
        fs.unlinkSync(csvPath);
        throw new ApiError(400, "No valid products found in CSV!");
      }
    const slugs=validProducts.map((p)=>p.slug)
    const existing=await Product.find({slug:{$in:slugs}}).select("slug");
    const existingSlugs=new Set(existing.map((p)=>p.slug))
  const newProducts=validProducts.filter((p)=>!existingSlugs.has(p.slug))
if(newProducts.length===0){
  fs.unlinkSync(csvPath)
  throw new ApiError(409, "All products already exist!")
}
    const productsWithImages=await  Promise.all(
      newProducts.map(async(p)=>{
        let imagesArr=[];
      if(p?.images){
          if(p.images?.startsWith("http")){
            imagesArr.push(p.images)
          }
        else{
         const uploaded= await uploadFileOnCloud(p.images);
         if(uploaded?.url) imagesArr.push(uploaded.url)
        }
      }
      let categoryId=await ensureCategoryExists(p?.category)
      return {
        ...p,
        images:imagesArr,
        category:categoryId,
      }
      })
    )
    const cleanProducts = productsWithImages.map((p, i) => ({
  ...p,
  price: Number(p.price) || 0,
  stock: Number(p.stock) || 0,
  lowStockAlert: Number(p.lowStockAlert) || 0,
  discount: Number(p.discount) || 0,
  createdBy: user?._id,
  sku: `SKU${Date.now()}${i}`.toUpperCase(),
}));
    const insertedProducts= await Product.insertMany(cleanProducts,{ordered:false});
    fs.unlinkSync(csvPath)
    if(!insertedProducts&&!insertedProducts.length){
      throw new ApiError(400,"Product uplaoded failed!")
    }
    return res.status(201).json(new ApiResponse(201,{insertedCount:insertedProducts.length,skippedProducts:existingSlugs.size,inserted:insertedProducts},"products created successfully"))

})

const bulkdelete=asyncHandler(async(req,res)=>{
  const user=req?.user;
  if(!user){
    throw new ApiError(401,"Unauthorized user!please login")
  }
  if(user?.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(400,"Access-denied retailer not allowed!")
  }
  const {ids}=req.body
   if(!ids&&ids.length===0){
    throw new ApiError(400,"At least one product selected for deleted!")
   }
   const existingProduct=await Product.find({_id:{$in:ids}})
   if(existingProduct.length===0){
      throw new ApiError(404,"No product found for the given IDs!")
   }
   for (const product of existingProduct) {
     if(product.images&&product.images.length>0){
      for (const img of product.images) {
        await deleteFileOnCloud(img)
      }
     }
   }
   const deletedProduct=await Product.deleteMany({_id:{$in:ids}})
   if(deletedProduct.length===0){
    throw new ApiError(400,"No products deleted. Please try again!")
   }
   return res.status(200).json(new ApiResponse(200,{total:deletedProduct.deletedCount,deletedProduct},"All selected products deleted successfully"))
})
const stats=asyncHandler(async(req,res)=>{
  const user=req?.user;
   if(!user){
    throw new ApiError(401,"Unauthorized user!please login")
  }
   if(user?.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(400,"Access-denied retailer not allowed!")
  }
  const totalProduct=await Product.countDocuments({})
   if(totalProduct&&totalProduct.length===0){
    throw new ApiError(400,"products not found!")
   }
   const totalVerified=await Product.countDocuments({isVerified:true})
   if(!totalVerified&&totalVerified.length===0){
    throw new ApiError(400,"")
   }
   const totalunVerified=await Product.countDocuments({isVerified:false})
   if(!totalunVerified&&totalunVerified.length===0){
    throw new ApiError(400,"unVerified Products is empty!")
   }
   const totalLowStock=await Product.find({$expr:{$lte:["$stock","$lowStrockAlert"]}})
   if(!totalLowStock&&totalLowStock.length===0){
    throw new ApiError(400,"No found low stock!")
   }
   const totalCategory=await Product.aggregate([
    {
      $group:{
        _id:"$category",total:{$sum:1}
      }
    },
    {
      $sort:{total:-1},
    },
    {
      $facet:{
        categories:[{$project:{_id:1,total:1}}],
        totalCatCount:[{$count:"totalCat"}]
      },
    
    },
    {  $project:{
        categories:0,
        total:0
      }}
   ])
   if(!totalCategory&&totalCategory.length===0){
    throw new ApiError(400,"No found category!")
   }
   const totalcat=totalCategory[0]?.totalCatCount[0]?.totalCat;
   return res.status(200).json(new ApiResponse(200,{totalProduct,totalVerified,totalunVerified,totalcat,totalLowStock},"Product statistics fetched successfully!"))
})
const deleteAllProducts=asyncHandler(async(req,res)=>{
  const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(404,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(403,"Access-denied retailer not allowed!")
  }
  const deleteProducts=await Product.deleteMany({}).populate("category");
  if(!deleteProducts){
    throw new ApiError(400,"Products not found!")
  }
   return res.status(200).json(new ApiResponse(200,{deletedProducts:deleteProducts.deletedCount,deleteProducts},"All products deleted successfully!"))
})
const bulkVerify=asyncHandler(async(req,res)=>{
  const isLoggedUser=req.user;
  if(!isLoggedUser){
    throw new ApiError(404,"Unauthorized user!please login")
  }
  if(isLoggedUser?.role?.trim().toLowerCase()==="retailer"){
    throw new ApiError(403,"Access-denied retailer not allowed!")
  }
 const {ids}=req.body;
 const validIds=[];
 const inValidIds=[];
 ids.forEach((id)=>{
  if(mongoose.isValidObjectId(id)){
    validIds.push(id)
  }else {
    inValidIds.push(id)
  }
 })
 if(validIds.length===0){
  throw new ApiError(400,"No valid product IDs provided!")
 }
  const updatePromises= validIds.map((id)=>
     Product.findByIdAndUpdate(id,{
      $set:{
        isVerified:true
      }
    },
  {
    new:true,
    runValidators:true,
  }).select("name slug isVerified")
  )
  const result=await Promise.allSettled(updatePromises)
  const successUpdate=[];
  const failedUpdate=[];
  result.forEach((res,i)=>{
    if(res.status==="fulfilled"&&res.value){
      successUpdate.push(res.value)
    }else{
      failedUpdate.push({
        id:validIds[i],
        reason:res.reason?.message||"Product not found",
      })
    }
  })
    if (successUpdate.length === 0) {
      throw new ApiError(404, "No products found with given IDs!");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          verifiedCount: successUpdate.length,
          products: successUpdate,
          failed: failedUpdate,
          invalidIds: inValidIds
        },
        `${successUpdate.length} product(s) verified successfully`
      )
    );
})
// public controller
const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "", category, brand } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filterField = {};

  if (search) {
    filterField.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  if (category?.trim()) filterField.category = category.trim().toLowerCase();
  if (brand?.trim()) filterField.brand = brand.trim().toLowerCase();
  filterField.isVerified = true;

  const allProducts = await Product.aggregate([
    { $match: filterField },
    {
      $project:{
       maxOrderQty:0,
       minOrderQty:0,
       lowStockAlert:0,
       gst:0,updatedBy:0,
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: Number(limit) }],
      },
    },
  ]);

  const totalProducts = allProducts[0]?.metadata[0]?.total || 0;
  const products = allProducts[0]?.data || [];

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          currentPage: Number(page),
          totalPage: Math.ceil(totalProducts / limit),
          total: totalProducts,
          products,
        },
        "Products fetched successfully!"
      )
    );
});
const getProductDetails = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new ApiError(400, "Slug is required!");
const validSlug=slug?.replace("-"," ")?.trim()?.toLowerCase();
console.log(validSlug);

  const product = await Product.findOne({$and:[ {slug:validSlug}, {isVerified: true},]}).select("-minOrderQty -maxOrderQty -lowStockAlert -updatedBy -createdBy");

  if (!product) throw new ApiError(404, "Product not found!");

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product details fetched successfully!"));
});

export { createProduct,updateProductdetails,updateProdImages,removeProduct,getProductByIdOrSlug,getAllProducts,toggleVerify,unVerifiedProducts,allProductsByAdminAndDist,deleteAllProducts,getProductDetails,stockUpdate,lowStock,bulkUploadProducts,stats,bulkdelete,bulkVerify};
