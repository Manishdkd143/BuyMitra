
import API from "../../api/axios";
export  async  function getCustomersInsights({page=1,limit=10,search=""}){
 const res= await API.get("/customers/insights",{params:{page,limit,search},withCredentials:true})
 console.log("customers",res);
 return res
}
export  async function getCustomersDirectory({page=1,limit=10,search=""}) {
  const res=await API.get("/customers/",{params:{page,limit,search},withCredentials:true})
   console.log("customers",res);
 return res
}
export async function addCustomer(formData) {
  const res=await API.post("/customers/add",formData,{withCredentials:true,headers:"multipart/form-data"})
  console.log("add customer",res)
  return res
}
export async function getCustomerById(customerId){
  const res=await API.get(`/customers/c/${customerId}`,{withCredentials:true})
  console.log(res.data)
  return res.data
} 
export async function getCustomerActivity(customerId) {
  const res=await API.get(`/customers/c/${customerId}/activity`)
  console.log("activity",res.data)
  return res
}
export async function getCustomerOverview(customerId) {
  const res=await API.get(`/customers/c/${customerId}/overview`)
  console.log("overview",res)
  return res.data
}
export async function getCustomerOrders(customerId) {
  const res=await API.get(`/customers/c/${customerId}/orders`)
  console.log("orders",res.data)
  return res
}
export async function getCustomerLedger(customerId) {
  const res=await API.get(`/customers/c/${customerId}/ledger`)
  console.log("ledger",res.data)
  return res
}
export async function getTopcustomers() {
  const res=await API.get(`/customers/insights/top`)
  console.log("top customers",res.data)
  return res
}