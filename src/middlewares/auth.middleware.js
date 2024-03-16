import { User } from "../models/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyToken= asyncHandler(async(req,res,next)=>{

    try {
        const accessToken= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        console.log(req.cookie);
        console.log(accessToken);
        if(!accessToken)
        {
            throw new ApiError(401, "Unauthorized")
        }
        
        const decodedToken= jwt.verify(accessToken, process.env.ACCESSS_TOKEN_SECRET);
        console.log(decodedToken._id);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        console.log(user);
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})