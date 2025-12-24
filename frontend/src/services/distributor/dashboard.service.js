import API from "../../api/axios";
export const getTopRetailers = () => {
  const res= API.get("/distributor/top-retailers");
  return res
};
export const getDistributorDashboard=async(user)=>{
const res=await API.get("/distributor/reports",user )
return res.data
}

