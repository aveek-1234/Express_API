import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessRefreshToken= async (userId)=>{
    try{
        const user= await User.findById(userId);
        console.log(user);
        const accessToken=  user.generateAccessToken();
        console.log(accessToken);
        const refreshToken= user.generateRefreshToken();
        console.log(refreshToken);
    return {accessToken, refreshToken};
    }catch{
       throw new ApiError(500, "SOmething went wrong while creating tokens")
    }
} 

const registerUser= asyncHandler(async (req,res)=>{
    const {fullname,username,email,password}= req.body;

    if([fullname,username,email,password].some((field)=>
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
    const checkPassword= user.isPasswordCorrect(password);
    if(!checkPassword)
    {
        throw new ApiError(401, "Invalid Credentials")
    }
    const {accessToken, refreshToken}= await generateAccessRefreshToken(user._id);
    console.log("accessToken"+accessToken);
    user.refreshToken= refreshToken;
    await user.save({validateBeforeSave:false})
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken");

    const options= {
        httpOnly:true,
        secure:true
    }
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
     await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken: undefined
        }
     )

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

export {registerUser,loginUser,logoutUser}