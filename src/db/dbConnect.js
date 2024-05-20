import mongoose from "mongoose";
import dotenv from "dotenv";
const  connectDb= async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`Connected ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Mongo Connection Failed:",error);
        process.exit(1)
    }
}

export default connectDb;
