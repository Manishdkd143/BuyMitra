import API from "../../api/axios"

export const getUserProfile=async()=>{
   const res= await API.get("/users/profile",{withCredentials:true})
   return res.data
}