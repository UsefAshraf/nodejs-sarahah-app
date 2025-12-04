import { Router } from "express";
import * as AuthService from "./Services/authentication.service.js";
const authcontroller = Router();

authcontroller.post('/signUp', AuthService.SignUpService);
authcontroller.post('/signIn', AuthService.SignInService);
//http://localhost:3000/verify-email?email=ya6407448@gmail.com

authcontroller.get('/verify-email/:token', AuthService.VerifyEmailService);
authcontroller.post('/refreshtoken',AuthService.RefreshTokenService);
authcontroller.post('/signout',AuthService.SignOutService);
authcontroller.post('/forgetpassword',AuthService.forgetPasswordService);
authcontroller.post('/resetpassword',AuthService.resetPasswordService);




export default authcontroller;