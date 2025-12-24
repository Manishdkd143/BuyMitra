import API from "../../api/axios";
export const getCompanyProfile = async () => {
  const res= await API.get("/distributor/companyprofile", { withCredentials: true });
  console.log("compony",res.data);
  
  return res.data
};

export const uploadUserProfilePic = (formData) =>
  API.patch("/changeprofile", formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

export const uploadDistributorDocuments = (formData) =>
  API.put("/distributor/documents", formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteDistributorDocument = (docId) =>
  API.delete(`/distributor/documents/${docId}`, {
    withCredentials: true,
  });
export const updateDistributorProfile = (data) => {
  return API.patch("/distributor/update", data, {
    withCredentials: true,
  });
};
