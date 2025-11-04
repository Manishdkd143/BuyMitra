import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
import asyncHandler from "./asyncHandler.js";
import {v2 as cloudinary} from "cloudinary"
// const fileUrl = "https://res.cloudinary.com/dhakad/image/upload/v1730055012/profilePics/user123_abc.png";

const deleteFileOnCloud=async(fileUrl)=>{
    console.log(fileUrl)
if(!fileUrl) return null;
for (const Url of fileUrl) {
    const parts=Url?.split('/');
    const fileName=parts?.pop()?.split(".")[0];
    const folderName=parts.slice(parts.indexOf("upload")+1).join('/');
    const publicId=`${folderName}/${fileName}`;
    const result=cloudinary.uploader.destroy(publicId)
    if(result.result=='ok'){
     return new ApiResponse(200,publicId,"File deleted successfully")
    }else{
        return new ApiError(402,"Failed to delete File!")
    }
}
}
export default deleteFileOnCloud