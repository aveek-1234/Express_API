import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema= new Schema(
    
        {
            firstName:{
                type:String,
                required:true,
                lowercase:true,
                trim:true,
                
            },
            lastName:{
                type:String,
                required: true,
                trim: true
            },
            email:{
                type:String,
                required: true,
                trim: true,
                lowercase:true,
                index: true
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
        this.password= await bcrypt.hash(this.password,10);
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
        firstName: this.firstName,
        lastName: this.lastName
    },
    
        process.env.ACCESSS_TOKEN_SECRET
    ,
    {
        expiresIn: process.env.ACCESSS_TOKEN_EXPIRY
    }
    )
    return accessToken;
}
userSchema.methods.generateRefreshToken= function(){
  
    const refreshToken= jwt.sign({
        _id: this._id
    },
    
       process.env.REFRESH_TOKEN_SECRET
    ,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )

    return refreshToken
}


export const User= mongoose.model("User", userSchema);