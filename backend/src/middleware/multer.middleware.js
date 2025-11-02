import multer from "multer"
import path from "path"
import { ApiError } from "../utils/ApiError"
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public")
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname))
    }
})
const fileFilter=(req,file,cb)=>{
    const allowedFiles=['jpeg','jpg','png','gif','webp']
    const extname=allowedFiles.includes(path.extname(file).toLowerCase());
    const mimetype=allowedFiles.includes(file.mimetype);
    if(extname&&mimetype){
        cb(null,true)
    }else{
     cb(new ApiError(400,"Only image files are allowed!"),false)
    }
}
export const Upload=multer({
    storage:storage,
     limits:{
        fileSize:5*1024*1024
     },
     fileFilter:fileFilter,
})