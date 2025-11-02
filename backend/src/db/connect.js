import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const ConnectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        if(connectionInstance){
            console.log("Database is Connected:",connectionInstance.connection.host);
            
        }else{
            console.error("Database not Connected!")
        }
    } catch (error) {
        console.error(error.message)
    }
}
export default ConnectDB;