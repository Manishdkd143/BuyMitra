import API from "../../api/axios";
export const getDistributorOrders = async (params) => {
  return API.get("/distributor/orders", {
    params,
    withCredentials: true,
  });
};

export const getDistributorOrderById = async(orderId) =>{
  const res=await API.get(`/distributor/order/${orderId}`)
  return res
};
export const updateOrderStatus = async(orderId, data) =>{
  const res=await API.put(`/distributor/order/status/${orderId}`, data)
return res
};