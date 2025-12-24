import API from "../api/axios";
export const loginUser=async(data)=>{
    const response=await API.post(`/auth/login`,data,{
        withCredentials:true,
    });
    return response.data;
}
export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data, { withCredentials: true ,headers: {
      "Content-Type": "multipart/form-data",
    },});
  console.log(response);
  
  return response.data;
};
export const getDistributors = async () => {
  const response = await API.get("/users/distributors");
  console.log(response.data);
  
  return response.data;
};
export const adminRegister=async(data)=>{
   const response = await API.post("/auth/admin/register", data, { withCredentials: true ,headers: {
      "Content-Type": "multipart/form-data",
    },});
  console.log(response);
  
  return response.data;
}
export const resetPassword=async(token,{newPassword,confirmPassword})=>{
const response=await API.post(`/auth/resetpassword/${token}`,{newPassword,
  confirmPassword},{withCredentials:true,headers:{
  "Content-Type":"application/json",
}})
return response
}
export const forgotPassword=async(email)=>{
  console.log("email",email);
  
const response=await API.post("/auth/forgotpassword",{email:email},{withCredentials:true})
return response
}