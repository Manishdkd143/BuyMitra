import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use(express.static("public"));
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(cookieParser());


//secured router
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
import productRouter from "./routes/product.routes.js"
import categoryRouter  from "./routes/category.routes.js"
import cartRouter from "./routes/cart.routes.js"
import addressRouter from "./routes/address.routes.js"
import distributorRouter from "./routes/distributor.routes.js"
import authRouter from "./routes/auth.routes.js"
import invertory from "./routes/inventory.routes.js"
import paymentRouter from "./routes/payment.routes.js";
import orderRouter from "./routes/order.routes.js"



app.use('/api/v1/auth',authRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/admin',adminRouter);
app.use('/api/v1/products',productRouter);
app.use('/api/v1/categories',categoryRouter);
app.use('/api/v1/carts',cartRouter);
app.use('/api/v1/address',addressRouter);
app.use('/api/v1/distributors',distributorRouter);
app.use("/api/v1/inventory",invertory)
app.use("/api/v1/payment",paymentRouter)
app.use("/api/v1/order",orderRouter)





export {app}