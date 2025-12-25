
import API from "../../api/axios";
export  async  function getCustomersInsights({page=1,limit=10,search=""}){
 const res= await API.get("distributor/customers/insights",{params:{page,limit,search},withCredentials:true})
 console.log("customers",res);
 return res
}
export  async function getCustomersDirectory({page=1,limit=10,search=""}) {
  const res=await API.get("/distributor/customers",{params:{page,limit,search},withCredentials:true})
   console.log("customers",res);
 return res
}
export async function addCustomer(formData) {
  const res=API.post("/distributor/add-customer",formData,{withCredentials:true,headers:"multipart/form-data"})
  return res
}