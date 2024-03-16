import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessRefreshToken= async (userId)=>{
    try{
        const user= await User.findById(userId);
        console.log(user);
        const accessToken=  user.generateAccessToken();
        console.log(accessToken);
        const refreshToken= user.generateRefreshToken();
        console.log(refreshToken);
    return {accessToken, refreshToken};
    }catch(error){
        console.log(error)
       throw new ApiError(500, "SOmething went wrong while creating tokens")
    }
} 

const registerUser= asyncHandler(async (req,res)=>{
    const {firstName,lastName,email,password}= req.body;

    if([firstName,lastName,email,password].some((field)=>
        field?.trim()===""))
    {
        console.log("test");
        throw new ApiError(400, "All fields are mandetory")
    }

    const presentUser= await User.findOne({email});
    if(presentUser)
    {
        throw new ApiError(409, "User Already present")
    }

    const user = await User.create({
         firstName,
         email,
         password,
         lastName
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

const loginUser= asyncHandler(async(req,res)=>{
    const {email, password}= req.body;
    if (!email || !password)
    {
        throw new  ApiError(400, "Please enter email and password")
    }
    const user = await User.findOne({email});
    if(!user)
    {
        throw new ApiError(404, "User Not found")
    }
    const checkPassword= await user.isPasswordCorrect(password);
    if(!checkPassword)
    {
        throw new ApiError(401, "Invalid Credentials")
    }
    const {accessToken, refreshToken}= await generateAccessRefreshToken(user._id);
    user.refreshToken= refreshToken;
    console.log(user);
    console.log("till here1 ");
    await user.save({validateBeforeSave:false})
    console.log("till here2 ");
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken");
    console.log(loggedInUser);

    const options= {
        httpOnly:true,
        secure:true
    }
    console.log("till here3 ");
    return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser, accessToken,refreshToken
                    },
                    "User logged in"
                    )
            )
})

const logoutUser= asyncHandler(async(req,res)=>{
    console.log("logout_req", req.user);
      const updatedUser=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                "refreshToken": undefined
            }
            
        },
        {
            new:true
        }
     )
     console.log("updated User "+updatedUser);
     const options={
        httpOnly:true,
        secure:true
     }

     return res
             .status(200)
             .clearCookie("accessToken",options)
             .clearCookie("refreshToken",options)
             .json(
                new ApiResponse (200,{},"User logged out successfully")
             )
})

const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incomingRefreshToken=  req.body.refreshToken;
    console.log(incomingRefreshToken);
    if(!incomingRefreshToken)
    {
        throw new ApiError(401, "Unauthorized Access");
    }
    const decodedToken= jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    console.log(decodedToken);
    const user = await User.findById(decodedToken?._id)
    console.log(user);
    if(user.refreshToken!=incomingRefreshToken)
    {
        throw new ApiError(400,"Token mismatch occured");
    }
    const {newAccessToken,newRefreshToken}= await generateAccessRefreshToken(decodedToken._id);
    user.refreshToken= newRefreshToken;
    console.log("Testing"+user);
    await user.save({validateBeforeSave:false})
    const options= {
        httpOnly:true,
        secure:true
    }
    return res
            .status(200)
            .cookie("accessToken",newAccessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                    new ApiResponse(
                        200,
                    {
                        user:  newAccessToken,newRefreshToken
                    },
                    "user has been assigned with new tokens"
                    )
                )

})

export {registerUser,loginUser,logoutUser,refreshAccessToken}