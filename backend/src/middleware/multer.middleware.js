import multer from "multer"
import path from "path"
import { ApiError } from "../utils/ApiError.js"
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"./public")
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname))
    }
})
const fileFilter = (req, file, cb) => {
  const allowedFiles = ["jpeg", "jpg", "png", "gif", "webp", "csv", "xlsx"];
  const extname = path.extname(file.originalname).toLowerCase().replace(".", "");

  if (allowedFiles.includes(extname)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image or spreadsheet files allowed!"), false);
  }
};
export const Upload=multer({
    storage:storage,
     limits:{
        fileSize:5*1024*1024
     },
     fileFilter:fileFilter,
})