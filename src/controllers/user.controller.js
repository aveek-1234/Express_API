import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser= asyncHandler(async (req,res)=>{
    const {fullname,username,email,password}= req.body;

    if([fullname,username,email,password].some((field)=>
        field?.trim()===""))
    {
        console.log("test");
        throw new ApiError(400, "All fields are mandetory")
    }

    const presentUser=User.findOne({email});
    if(presentUser)
    {
        throw new ApiError(409, "User Already present")
    }

    const user = await User.create({
         fullname,
         email,
         password,
         username
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if(!createdUser)
    {
        throw new ApiError(500, "Error in creating new user");
    }

    return res.status(201).json(
        new ApiResponse(200, "User created Successfully")
    )
})

export {registerUser}