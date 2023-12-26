import dotenv from "dotenv";
import connectDb from "./db/dbConnect.js";
import app from "./app.js";

connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server Runninng at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO FAILED TO CONNECT",err)
});