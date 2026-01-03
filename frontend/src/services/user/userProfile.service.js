import API from "../../api/axios"

export const getUserProfile=async()=>{
   const res= await API.get("/users/profile",{withCredentials:true})
   return res.data
}
export const updateUserProfile=async(formData)=>{
   console.log("form",formData)
   const res=await API.post("/users/updateinfo",formData,{withCredentials:true})
   return res
}