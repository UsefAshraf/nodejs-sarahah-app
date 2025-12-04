import { compareSync } from "bcrypt";
import blackListTokens from "../../../DB/models/black-list-tokens.model.js";
import { User } from "../../../DB/models/user.model.js";
import { Decryption, Encryption } from "../../../Utils/encryption.utils.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { emitter } from "../../../Services/send-email.service.js";

export const profileservice = async (req, res, next) => {
  // return next(new Error('test html error by next',{cause:401}));
  const { _id } = req.loggedInUser;
  const secretloginkey =
    process.env.JWT_LOGIN_SECRET_KEY || "jwtLoginSecretKey";

  const secretKey = process.env.ENCRYPTED_KEY;

  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  console.log(user);

  user.phone = await Decryption({
    ciphertext: user.phone,
    secretKey: "encryptPhoneKey",
  });
  return res
    .status(200)
    .json({ message: "user profile fetched successfully", user });
};

export const updatePasswordService = async (req, res) => {
  try {
    const { _id } = req.loggedInUser;
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "user not found" });
    const isPasswordMatch = compareSync(oldPassword, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({ message: "invalid old password" });
    if (newPassword !== confirmNewPassword)
      return res
        .status(400)
        .json({ message: "new password and confirm password do not match" });
    user.password = await bcrypt.hashSync(newPassword, 10);
    await user.save();

    await blackListTokens.create(req.loggedInUser.token);

    return res.status(200).json({ message: "password updated successfully" });
  } catch (error) {
    console.log("catch error from update password service", error);
    res.status(500).json({ message: "internal server error", error });
  }
};

export const updateProfileService = async (req, res) => {
  try {
    const secretKey = process.env.JWT_SECRET_KEY || "jwtSecretKey";

    const { _id } = req.loggedInUser;
    const { email, username, phone } = req.body;

    const user = await User.findById(_id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (username) user.username = username;
    if (phone) {
      const encryptedPhone = await Encryption({
        value: phone,
        secretKey: "encryptPhoneKey",
      });
      user.phone = encryptedPhone;
    }
    if (email) {
      const isEmailExists = await User.findOne({ email });
      if (isEmailExists)
        return res.status(409).json({ message: "email already exists" });
      const token = jwt.sign({ _id: user._id, email: user.email }, secretKey, {
        expiresIn: "1h",
        jwtid: uuidv4(),
      });
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
      });

      user.isEmailVerified = false;
      user.email = email;
    }

    await user.save();

    return res
      .status(200)
      .json({ message: "profile updated successfully", user });
  } catch (error) {
    console.log("catch error from update profile service", error);
    res.status(500).json({ message: "internal server error", error });
  }
};

export const listUser = async (req, res) => {
  try {
    const users = await User.find();
    return res
      .status(200)
      .json({ message: "users fetched successfully", users });
  } catch (error) {
    console.log("catch error from list user service", error);
    res.status(500).json({ message: "internal server error", error });
  }
};
