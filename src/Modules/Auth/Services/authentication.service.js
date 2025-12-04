import { User } from "../../../DB/models/user.model.js";

import bcrypt, { compareSync, hashSync } from "bcrypt";
import { Encryption } from "../../../Utils/encryption.utils.js";
import { Sendmailservice } from "../../../Services/send-email.service.js";
import path from "path";
import { emitter } from "../../../Services/send-email.service.js";
// const jwt = require('jsonwebtoken');
import jwt from "jsonwebtoken";
import blackListTokens from "../../../DB/models/black-list-tokens.model.js";
import { v4 as uuidv4 } from "uuid";

const secretKey = process.env.JWT_SECRET_KEY || "jwtSecretKey";
const secretloginkey = process.env.JWT_LOGIN_SECRET_KEY || "jwtLoginSecretKey";
const secretRefreshKey =
  process.env.JWT_REFRESH_SECRET_KEY || "jwtRefreshSecretKey";
export const SignUpService = async (req, res) => {
  try {
    const { email, password, confirmPassword, username, phone, age } = req.body;

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "password and confirm password do not match" });
    }

    const isEmailExists = await User.findOne({ email });
    if (isEmailExists)
      return res.status(409).json({ message: "email already exists" });

    const encryptedPhone = await Encryption({
      value: phone,
      secretKey: "encryptPhoneKey",
    });

    const hashPassword = await bcrypt.hashSync(password, +process.env.SALT);
    const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

    const confirmEmailLink = `${req.protocol}://${req.headers.host}/auth/verify-email/${token}`;

    emitter.emit("SendEmail", {
      to: email,
      subject: "Verify your email",
      message: {
        html: `
      <h2>Verify your email</h2>
      <p>Click the link below to activate your account:</p>
      <a href="${confirmEmailLink}" style="color: blue;">Verify Email</a>
    `,
        data: { email },
      },
      attachments: [
        {
          filename: "profile.jpeg",
          path: path.resolve("Assets/profile.jpeg"),
        },
      ],
    });

    const user = await User.create({
      email: email,
      password: hashPassword,
      username,
      phone: encryptedPhone,
      age,
    });
    if (!user)
      return res.status(400).json({ message: "failed to create user" });
    return res.status(201).json({ message: "user created successfully", user });
  } catch (err) {
    console.log("catch error from signup service ", err);
    res.status(500).json({ message: "intenal server error", err });
  }
};

export const VerifyEmailService = async (req, res) => {
  try {
    const { token } = req.params;
    // const user = await User.findOne({ email });
    // if (!user)
    //   return res.status(404).json({ message: "email not found" });

    // user.isEmailVerified = true;
    // await user.save();
    const decodedToken = jwt.verify(token, secretKey);
    console.log(decodedToken);

    const user = await User.findOneAndUpdate(
      { email: decodedToken.email },
      { isEmailVerified: true },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "email verified successfully", user });
  } catch (error) {
    console.log("catch error from verify email service ", error);
    res.status(500).json({ message: "intenal server error", error });
  }
};

export const SignInService = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "email not found, please sign up" });

    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({ message: "invalid password" });

    const accessToken = jwt.sign(
      { _id: user._id, email: user.email },
      secretloginkey,
      { expiresIn: "1h", jwtid: uuidv4() }
    );
    const refreshToken = jwt.sign(
      { _id: user._id, email: user.email },
      secretRefreshKey,
      { expiresIn: "1d", jwtid: uuidv4() }
    );

    return res
      .status(200)
      .json({ message: "signin successful", accessToken, refreshToken });
  } catch (error) {
    console.log("catch error from signinService", error);
    res.status(500).json({ message: "internal server error", error });
  }
};

export const RefreshTokenService = async (req, res) => {
  try {
    const { refreshtoken } = req.headers;

    if (!refreshtoken) {
      return res.status(401).json({ message: "refresh token missing" });
    }

    const decodedRefreshToken = jwt.verify(refreshtoken, secretRefreshKey);
    const accessToken = jwt.sign(
      { _id: decodedRefreshToken._id, email: decodedRefreshToken.email },
      secretloginkey,
      { expiresIn: "1h", jwtid: uuidv4() }
    );

    return res
      .status(200)
      .json({ message: "refresh successdfully", accessToken });
  } catch (error) {
    console.log("catch error from refresh token service ", error);
    res.status(500).json({ message: "intenal server error", error });
  }
};

export const SignOutService = async (req, res) => {
  try {
    const { accesstoken, refreshtoken } = req.headers;
    const decodedData = jwt.verify(accesstoken, secretloginkey);
    const decodedDataRefreshToken = jwt.verify(refreshtoken, secretRefreshKey);
    await blackListTokens.insertMany([
      {
        tokenId: decodedData.jti,
        expiryDate: decodedData.exp,
      },
      {
        tokenId: decodedDataRefreshToken.jti,
        expiryDate: decodedDataRefreshToken.exp,
      },
    ]);
    return res.status(200).json({ message: "signout successdfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "intenal server error", error });
  }
};

export const forgetPasswordService = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "this email is not registered" });
    const otp = uuidv4();
    emitter.emit("SendEmail", {
      to: email,
      subject: "reset your password",
      message: {
        html: `
      <h2>reset your password</h2>
      <p>otp is ${otp}</p>
    `, 
      },
    });

    //hash otp
    const hashedOtp = hashSync(otp,10);
    user.otp = hashedOtp;
    await user.save();

    return res.status(200).json({message:"otp sent successfully"});

  } catch (error) {
    console.log("catch error from forget password service ", error);
    res.status(500).json({ message: "intenal server error", error });
  }
};


export const resetPasswordService = async (req,res) => {
  try{
    const {email , otp , password , confirmpassword } = req.body;
    if(password !== confirmpassword) return res.status(400).json({message:"passwords do not match"});

    const user = await User.findOne({email});
    if(!user) return res.status(404).json({message:"user not found"});
    if(!user.otp) return res.status(404).json({message:"no otp sent"})

    const isOtpMatch = compareSync(otp,user.otp);
    if(!isOtpMatch) return res.status(400).json({message:"invalid otp"});

    const hashedPassword = hashSync(password,10);
    user.password = hashedPassword;
    user.otp = null;
    await user.save();

    return res.status(200).json({message:"password reset successfully"});
  }catch(error){
    console.log("catch error from reset password service ", error);
    res.status(500).json({ message: "intenal server error", error });
  }
}




