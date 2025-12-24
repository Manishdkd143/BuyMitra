import API from "../../api/axios";
export const getProductById = async (productId) => {
  const res= await API.get(`/product/${productId}`, {
    withCredentials: true,
  });
  console.log("Each prod",res)
  return res.data
};
export const bulkUploadProducts = async (formData) => {
      console.log("form entries before axios:", [...formData.entries()]);
     const res = await API.post(
      "/distributor/bulkupload",
      formData,
      {
        headers: {  "Content-Type": "multipart/form-data" },
        withCredentials: true
      }
    );
    console.log("backend",res)
    return res.data
};
export const getDistributorProducts = async ({ page = 1, limit = 10, search ="" }) => {
 const res=await  API.get("/distributor/products", {
    params: { page, limit, search },
    withCredentials: true,
  });
  return res.data
};
export const createProduct = async (formData) => {
  console.log("add form data",formData)
  return await API.post("/product/create", formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const  deleteProduct = async (productId) => {
 const res=await API.delete(`/product/delete/${productId}`, {
    withCredentials: true,
  });
  console.log("delete",res.data);
  return res.data
};
export const getLowStockProducts = async() => {
  const res=await API.get("/product/i/low-stock");
  console.log("low",res);
  return res
};
export const getOutStockProducts = async() => {
  const res=await API.get("/product/i/out-stock");
  console.log("out",res);
  return res
};
export const updateProduct = async (productId, formData) => {
  console.log("formData in service:", [...formData.entries()]);
  return await API.patch(`/product/update/${productId}`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const getDistributorProductById = async (productId) => {
  const res= await API.get(`/distributor/product/${productId}`, {
    withCredentials:true,
  });
  console.log("distributor prod",res)
  return res.data;
}