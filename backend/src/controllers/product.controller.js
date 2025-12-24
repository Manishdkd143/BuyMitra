import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import fs from "fs"
import uploadFileOnCloud from "../utils/Cloudinary.js";
import deleteFileOnCloud from "../utils/deleteFileOnCloud.js";
import { ensureCategoryExists } from "../utils/category.helper.js";
import mongoose from "mongoose";
import XLSX from "xlsx";
import { Inventory } from "../models/inventory.model.js";


/* ================= CREATE PRODUCT ================= */
const createProduct = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) throw new ApiError(401, "Unauthorized");
  if (user.role === "retailer")
    throw new ApiError(403, "Retailer not allowed");

  const {
    name,
    description,
    price,
    wholesalePrice,
    sku,
    category,
    unit = "piece",
    unitsPerBase,
    brand,
    stock = 0,
  } = req.body;

  // ---------------- VALIDATION ----------------
  if (!name || !price || !wholesalePrice || !category)
    throw new ApiError(400, "Required fields missing");

  const normalizedUnit = unit.toLowerCase();

  if (
    normalizedUnit !== "piece" &&
    (!unitsPerBase || Number(unitsPerBase) <= 0)
  ) {
    throw new ApiError(
      400,
      "unitsPerBase required for non-piece units"
    );
  }

  // ---------------- SKU ----------------
  const skuValue = sku
    ? sku.trim().toUpperCase()
    : `${name.substring(0, 3).toUpperCase()}-${Date.now()}`;

  if (await Product.findOne({ sku: skuValue }))
    throw new ApiError(409, "SKU already exists");

  // ---------------- SLUG ----------------
  const slug = `${name}-${skuValue}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // ---------------- IMAGES ----------------
  if (!req.files?.length)
    throw new ApiError(400, "At least one image required");

  const uploaded = await Promise.all(
    req.files.map((f) => uploadFileOnCloud(f.path))
  );

  req.files.forEach(
    (f) => fs.existsSync(f.path) && fs.unlinkSync(f.path)
  );

  const images = uploaded.filter((i) => i?.url).map((i) => i.url);
  if (!images.length)
    throw new ApiError(400, "Image upload failed");

  // ---------------- CATEGORY ----------------
  const categoryDoc = await ensureCategoryExists(category);

  // ---------------- CREATE PRODUCT ----------------
  const product = await Product.create({
    name: name.trim().toLowerCase(),
    description,
    sku: skuValue,
    slug,
    price: Number(price),
    wholesalePrice: Number(wholesalePrice),
    images,
    thumbnail: images[0],
    unit: normalizedUnit,
    unitsPerBase: normalizedUnit === "piece" ? 1 : Number(unitsPerBase),
    brand: brand?.trim() || null,
    category: categoryDoc._id,
    createdBy: user._id,
  });

  // ---------------- INVENTORY ----------------
  let quantity = Number(stock || 0);

  if (product.unit !== "piece") {
    quantity = quantity * product.unitsPerBase;
  }

  await Inventory.create({
    distributorId: user._id,
    productId: product._id,
    quantity,
  });

  return res.status(201).json(
    new ApiResponse(201, product, "Product created successfully")
  );
});


/* ================= UPDATE PRODUCT ================= */
const updateProductdetails = asyncHandler(async (req, res) => {
  console.log("Update product req.body:", req.body);
  console.log("Update product req.files:", req.files);

  const user = req.user;
  if (!user || user.role === "retailer") {
    throw new ApiError(403, "Not allowed");
  }

  const { productId } = req.params;
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // ✅ allowed fields
  const allowed = [
    "name",
    "description",
    "price",
    "wholesalePrice",
    "gst",
    "unit",
    "unitsPerBase",
    "status",
    "brand",
  ];

  const update = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) {
      update[f] = req.body[f];
    }
  });

  // 🔒 HARD BLOCK
  if (req.body.sku || req.body.slug) {
    throw new ApiError(400, "SKU & Slug cannot be updated");
  }

  // ✅ category
  if (req.body.category) {
    const cat = await ensureCategoryExists(req.body.category);
    update.category = cat._id;
  }

  // ✅ unit validation
  if (
    update.unit &&
    update.unit !== "piece" &&
    (!update.unitsPerBase || Number(update.unitsPerBase) <= 0)
  ) {
    throw new ApiError(400, "unitsPerBase required for selected unit");
  }

  // ✅ IMAGE HANDLING
  if (req.files?.thumbnail) {
    update.thumbnail = await uploadToCloud(req.files.thumbnail[0]);
  }

  if (req.files?.images) {
    update.images = await Promise.all(
      req.files.images.map(file => uploadToCloud(file))
    );
  }

  update.updatedBy = user._id;

  // ---------------- UPDATE PRODUCT ----------------
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: update },
    {new:true},
  );

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // ---------------- UPDATE STOCK ----------------
  if (req.body.stock !== undefined) {
    let stockQty = Number(req.body.stock);

    if (isNaN(stockQty) || stockQty < 0) {
      throw new ApiError(400, "Invalid stock value");
    }

    // ✅ SINGLE conversion (backend only)
    let finalQty =
      product.unit === "piece"
        ? stockQty
        : stockQty * product.unitsPerBase;

    await Inventory.findOneAndUpdate(
      {
        productId: product._id,
        distributorId: user._id,
      },
      { $set: { quantity: finalQty } },
      { upsert: true, new: true }
    );
  }

  return res.json(
    new ApiResponse(
      200,
      product,
      "Product, images & stock updated successfully"
    )
  );
});




/* ================= UPDATE PRODUCT IMAGES ================= */
const updateProdImages = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  if (!req.files?.length)
    throw new ApiError(400, "Images required");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  if (product.images?.length) {
    await deleteFileOnCloud(product.images);
  }

  const uploaded = await Promise.all(
    req.files.map(f => uploadFileOnCloud(f.path))
  );

  req.files.forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));

  const images = uploaded.map(i => i.url);
  product.images = images;
  product.thumbnail = images[0];
  await product.save();

  res.json(new ApiResponse(200, product, "Images updated"));
});


/* ================= DELETE PRODUCT ================= */
// const removeProduct = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   const product = await Product.findByIdAndDelete(productId);
//   if (!product) throw new ApiError(404, "Product not found");

//   if (product.images?.length) {
//     await deleteFileOnCloud(product.images);
//   }

//   res.json(
//     new ApiResponse(200, product, "Product deleted successfully")
//   );
// });
// const removeProduct = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   const product = await Product.findByIdAndDelete(productId);
//   if (!product) throw new ApiError(404, "Product not found");
//   if (product.images?.length) {
//     await deleteFileOnCloud(product.images);
//   }
//   res.json(
//     new ApiResponse(200, product, "Product deleted successfully")
//   );
// });
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = req.user;

  if (!user || user.role === "retailer") {
    throw new ApiError(403, "Not allowed");
  }

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // Find product
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  // Ownership check
  if (
    user.role === "distributor" &&
    product.createdBy.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Not allowed");
  }

  // Delete inventory
  await Inventory.deleteOne({ productId: product._id });

  // Delete product
  await Product.deleteOne({ _id: product._id });

  // Delete images from cloud
  if (product.images?.length) {
    await Promise.all(
      product.images.map((img) => deleteFileOnCloud(img))
    );
  }

 

  return res.json(
    new ApiResponse(200, null, "Product deleted successfully")
  );
});


/* ================= BULK UPLOAD (PRODUCT ONLY) ================= */
const bulkUploadProducts = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) throw new ApiError(401, "Unauthorized");
  if (user.role !== "distributor")
    throw new ApiError(403, "Only distributor can bulk upload");

  if (!req.file) throw new ApiError(400, "File required");

  const workbook = XLSX.readFile(req.file.path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  if (!rows.length) throw new ApiError(400, "Empty file");

  // ----------------- PRODUCT DATA -----------------

const productsPayload = [];
for (let i = 0; i < rows.length; i++) {
  const p = rows[i];
  if (
  !p.name ||
  !p.price ||
  !p.wholesalePrice ||
  !p.category ||
  !p.unit ||
  p.stock === undefined
) {
  throw new ApiError(
    400,
    `Row ${i + 2}: name, price, wholesalePrice, category, unit, stock required`
  );
}

  const categoryId = await ensureCategoryExists(p.category);

  const generateSlug = (name, sku) => {
    return `${name}-${sku}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };
 const sku = p.sku
  ? p.sku.toUpperCase().trim()
  : `SKU-${Date.now()}-${i}`;//unitsPerBase example:chilli 1kg=50pieces
 const unit =p.unit.toLowerCase();
 const unitsPerBase=unit==="piece"?1:Number(p.unitsPerBase)
if(unit!=="piece"&&(!unitsPerBase||unitsPerBase<=0)){
  throw new ApiError(400,`Row ${i+2}: Invalid unitsPerBase for unit ${unit}`);
}
  productsPayload.push({
    name: p.name.trim().toLowerCase(),
    price: Number(p.price),
    brand:p.brand?.trim()||null,
    sku,
    slug: generateSlug(p.name, sku), 
    category: categoryId,
    createdBy: user._id,
    wholesalePrice: Number(p.wholesalePrice),
    unit,
    unitsPerBase:unitsPerBase,
  });
}

  // ----------------- INSERT PRODUCTS -----------------
  const insertedProducts = await Product.insertMany(
    productsPayload,
    { ordered: false }
  );
  if(!insertedProducts||insertedProducts.length===0){
    throw new ApiError(500,"Product insertion failed!")
  }
  console.log("Inserted products:", insertedProducts.length);

  // ----------------- INVENTORY DATA -----------------
const inventoryPayload = insertedProducts.map((product) => {
  const row = rows.find(
    r =>
      (r.sku || "").toUpperCase() === product.sku
  );
  console.log("Matching row for inventory:", product)
 let quantity=Number(row?.stock||0);
 if(product.unit!=="piece"){
  quantity=quantity*Number(product.unitsPerBase)
 }

  return {
    distributorId: user._id,
    productId: product._id,
    quantity:quantity,
  };
});
console.log("Inventory payload prepared:", inventoryPayload);

 const inventory = await Inventory.insertMany(inventoryPayload, { ordered: false });
if(!inventory||inventory.length===0){
  throw new ApiError(500, "Inventory creation failed")
}
if(insertedProducts.length&&inventory.length){
  fs.existsSync(req.file.path);
  fs.unlinkSync(req.file.path)
}
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        productsInserted: insertedProducts.length,
        inventoryCreated: inventory.length,
      },
      "Bulk products & inventory uploaded successfully"
    )
  );
});

const getAllProducts = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user || user.role === "retailer")
    throw new ApiError(403, "Not allowed");

  const {
    page = 1,
    limit = 10,
    search = "",
    status,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const query = {
    createdBy: user._id,

  };

  if (status) query.status = status;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json(
    new ApiResponse(
      200,
      {
        products,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
      "Products fetched"
    )
  );
});

const getProductDetails = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user)
    throw new ApiError(401, "Unauthorized user");

  if (user.role === "retailer")
    throw new ApiError(403, "Access denied");

  const { productId } = req.params;

  if (!mongoose.isValidObjectId(productId))
    throw new ApiError(400, "Invalid product ID");

  // Fetch product
  const product = await Product.findById(productId)
    .populate("category", "name");

  if (!product)
    throw new ApiError(404, "Product not found");

  // Ownership check
  if (
    user.role === "distributor" &&
    product.createdBy.toString() !== user._id.toString()
  ) {
    throw new ApiError(403, "Not allowed");
  }

  // Fetch inventory
  const inventory = await Inventory.findOne({
    productId: product._id,
    distributorId: user._id,
  });

  const stock = inventory?.quantity || 0;

  res.json(
    new ApiResponse(
      200,
      {
        product,
        stock, 
      },
      "Product details fetched"
    )
  );
});
const getLowStockProducts=asyncHandler(async(req,res)=>{
  const user=req.user;
  if(!user||user.role==="retailer"){
    throw new ApiError(403,"Not allowed!");
  }
   const {
    page = 1,
    limit = 10,
    search = "",
  } = req.query;

const lowStockThreshold = 10;
const pageNum = Number(page);
const limitNum = Number(limit);
const skip = (pageNum - 1) * limitNum;



const productData = await Inventory.aggregate([
  {
    $match: {
      distributorId: user._id,
      quantity: { $gt:1,$lt: lowStockThreshold },
    },
  },

  {
    $lookup: {
      from: "products",
      localField: "productId",
      foreignField: "_id",
      as: "product",
    },
  },
  { $unwind: "$product" },

  ...(search
    ? [
        {
          $match: {
            $or: [
              { "product.name": { $regex: search, $options: "i" } },
              { "product.sku": { $regex: search, $options: "i" } },
              { "product.brand": { $regex: search, $options: "i" } },
            ],
          },
        },
      ]
    : []),

  {
    $lookup: {
      from: "categories",
      localField: "product.category",
      foreignField: "_id",
      as: "category",
    },
  },
  { $unwind: "$category" },

  {
    $facet: {
      products: [
        {
          $project: {
            _id: 0,
            productId: "$product._id",
            name: "$product.name",
            sku: "$product.sku",
            brand: "$product.brand",
            images: "$product.images",
            stock: "$quantity",
            categoryId: "$category._id",
            categoryName: "$category.name",
          },
        },
        { $skip: skip },
        { $limit: limitNum },
      ],
      totalCount: [
        { $count: "count" },
      ],
    },
  },

  {
    $project: {
      products: 1,
      total: {
        $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
      },
    },
  },
]);

  if(!productData.length){
    throw new ApiError(404,"No Low stock products for now!");
  }
  const products=productData[0]?.products||[];
  const total=productData[0]?.total||0
   res.status(200).json(new ApiResponse(200,{products,totalProducts:products.length,page:pageNum,totalPages: Math.ceil(Number(total) / limit)},"Low stock products fetched successfully"))
})
const getOutStockProducts=asyncHandler(async(req,res)=>{
  const user=req.user;
  if(!user||user.role==="retailer"){
    throw new ApiError(401,"access denied only distributor allowed!")
  }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
   const result=  await Inventory.aggregate([
      {
        $match:{
          distributorId:user._id,
          quantity:0
        }
      },
      {
        $lookup:{
          from:"products",
          localField:"productId",
          foreignField:"_id",
          as:"product"
        }
      },
      {
        $unwind:"$product"
      },
      ...(search?[
        {
          $match:{
            $or:[{"product.name":{$regex:search,$options:"i"}},
              {"product.brand":{$regex:search,$options:"i"}},
              {"product.sku":{$regex:search,$options:"i"}}
            ],

          }
        }
      ]:[]),
      {
        $lookup:{
           from:"categories",
           localField:"product.category",
           foreignField:"_id",
           as:"category"
        }
      },
      {
        $unwind:"$category"
      },
      {
        $facet:{
          products:[
            {
              $project:{
                  _id: 0,
            productId: "$product._id",
            name: "$product.name",
            sku: "$product.sku",
            brand: "$product.brand",
            images: "$product.images",
            stock: "$quantity",
            categoryId: "$category._id",
            categoryName: "$category.name",
              }
            },
            {$skip:skip},
            {$limit:Number(limit)}
          ],
          totalCount:[
           { $count:"count"},
          ]
        }
      },
      {
        $project:{
          products:1,
          total:{$ifNull:[{$arrayElemAt:["$totalCount.count",0]},0]
        }
      }
    }
    ])

     const products = result[0]?.products || [];
    const totalProducts = result[0]?.total[0]?.count || 0;

    res.status(200).json({
      success: true,
      products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
})
/* ================= EXPORT ================= */
export {
  createProduct,
  updateProductdetails,
  updateProdImages,
  deleteProduct,
  bulkUploadProducts,
  getAllProducts,
  getProductDetails,
  getLowStockProducts,
  getOutStockProducts
};
