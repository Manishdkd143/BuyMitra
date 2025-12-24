// import API from "../api/axios";
// export const createProduct = async (formData) => {
//   return await API.post("/product/create", formData, {
//     withCredentials: true,
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };
// export const getDistributorProducts = async ({ page = 1, limit = 10, search ="" }) => {
//  const res=await  API.get("/distributor/products", {
//     params: { page, limit, search },
//     withCredentials: true,
//   });
//   return res.data
// };
// export const bulkUploadProducts = async (formData) => {
//   return API.post("/distributor/products/bulk-upload", formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//     withCredentials: true,
//   });
// };
// export const getProductById = async (id) => {
//   const res= await API.get(`/distributor/products/${id}`, {
//     withCredentials: true,
//   });
//   console.log("pro",res)
//   return res.data
// };
