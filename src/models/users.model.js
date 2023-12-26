import mongoose, {Schema} from "mongoose";
import pkg from 'jsonwebtoken';
const { Jwt } = pkg;
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
    return Jwt.sign({
        _id: this._id,
        email:this.email,
        fullname: this.fullname,
        username: this.username
    },
    process.env.ACCESSS_TOKEN_SECRET,
    {
        expiresIn: ACCESSS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken= function(){
    return Jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: REFRESH_TOKEN_EXPIRY
    }
    )
}


export const User= mongoose.model("User", userSchema);