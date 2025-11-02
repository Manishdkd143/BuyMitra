import dotenv from "dotenv"
import ConnectDB from "./db/connect.js"
import { app } from "./app.js"
import { PORT } from "./constant.js"
dotenv.config({
    path:"./.env",
})
ConnectDB()
.then(()=>{
    app.on('error',(err)=>{
        console.log("Connection is failed!",err)
    })
    app.listen(PORT,()=>{
        console.log(`Server is running on ${PORT}`)
    })
}).catch((err)=>console.log("Error",err))