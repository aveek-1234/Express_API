import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema= new Schema(
    
        {
            username:{
                type:String,
                required:true,
                lowercase:true,
                trim:true,
                index: true
            },
            fullname:{
                type:String,
                required: true,
                trim: true
            },
            email:{
                type:String,
                required: true,
                trim: true,
                lowercase:true
            },
            password:{
                type:String,
                required:true,
            },
            refreshToken:{
                type: String
            }
        },
        {
            timestamps:true
        }   
)

userSchema.pre("save", async function(next){
    if(this.isModified("password"))
    {
        this.password= bcrypt.hash(this.password,10);
    }
    next();
})

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function(){
    console.log("inside access token")
    const accessToken= jwt.sign({
        _id: this._id,
        email:this.email,
        fullname: this.fullname,
        username: this.username
    },
    {
        secret:process.env.ACCESSS_TOKEN_SECRET
    },
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
    return accessToken;
}
userSchema.methods.generateRefreshToken= function(){
  
    const refreshToken= jwt.sign({
        _id: this._id
    },
    {
        secret:process.env.REFRESH_TOKEN_SECRET
    },
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
    console.log("refreshtoken: "+refreshToken);
    return refreshToken
}


export const User= mongoose.model("User", userSchema);