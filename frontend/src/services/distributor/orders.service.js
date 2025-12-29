import API from "../../api/axios";
export const getDistributorOrders = async (params) => {
  return API.get("/orders/o/", {
    params,
    withCredentials: true,
  });
};
export const getDistributorPendingOrders=async(params)=>{
  const res=await API.get('/orders/o/pending',{params,withCredentials:true})
  console.log("pending",res)
  return res
}
export const getDistributorDeliveredOrders=async(params)=>{
  const res=await API.get('/orders/o/completed',{params,withCredentials:true})
  console.log("delivered",res)
  return res
}
export const getDistributorCancelledOrders=async(params)=>{
  const res=await API.get('/orders/o/cancelled',{params,withCredentials:true})
  console.log("cancelled",res)
  return res
}
export const getDistributorOrderById = async(orderId) =>{
  const res=await API.get(`/orders/${orderId}`)
  return res
};
export const updateOrderStatus = async(orderId, data) =>{
  const res=await API.put(`/distributor/order/status/${orderId}`, data)
return res
};