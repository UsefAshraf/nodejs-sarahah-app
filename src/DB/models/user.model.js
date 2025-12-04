import mongoose from "mongoose";
import { systemRoles } from "../../constants/users.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true,'Username is required'],
      unique: [true,'Username must be unique'],
      lowercase: true,
      trim: true,
        minlength: [3,'Username must be at least 3 characters long'],
        maxlength: [30,'Username cannot exceed 30 characters'],
    },
    email: {
        type: String,
      required: [true,'Username is required'],
      unique: [true,'Username must be unique'],
    },
    password:{
        type:String,
        required: [true,'Username is required'],
    },
    phone:{
        type:String,
        required:[true,'Phone number is required'],
    },
    profileImage:{
        type:String,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
    isEmailVerified:{
        type:Boolean,
        default:false,
    },
    otp:String,
    role:{
      type:String,
      default:systemRoles.USER,
      enum:Object.values(systemRoles)
    }
  }, 
  {
    timestamps: true,
  }
);


export const User = mongoose.models.User || mongoose.model('User',userSchema);