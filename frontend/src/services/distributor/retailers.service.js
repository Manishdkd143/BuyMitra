
import API from "../../api/axios";
export const createRetailer = async(data) =>{
  const res=await API.post("/distributor/add-retailer", data, {
    withCredentials: true,
  });
  console.log(res);
  
  return res
}
export const getRetailers = async ({ page, limit = 10, search = "" }) => {
  return await API.get("/distributor/retailers", {
    params: { page, limit, search },   // QUERY
    withCredentials: true              // SEPARATE CONFIG
  });
};
