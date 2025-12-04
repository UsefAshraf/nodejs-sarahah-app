import { Router } from "express";
import * as Profileservice from "./Services/profile.service.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import { authorizationMiddleware } from "../../Middleware/authentication.middleware.js";
import { systemRoles } from "../../constants/users.js";
import asyncHandler from 'express-async-handler'
import { errorHandler } from "../../Middleware/errorhandler.middleware.js";

const usercontroller = Router();

// usercontroller.get(
//   "/profile",
//   authenticationMiddleware(),
//   asyncHandler(Profileservice.profileservice)
// );

usercontroller.get(
  "/profile",
  authenticationMiddleware(),
  errorHandler(Profileservice.profileservice)
);
usercontroller.patch(
  "/updatepassword",
  authenticationMiddleware(),
  Profileservice.updatePasswordService
);
usercontroller.put(
  "/updateprofile",
  authenticationMiddleware(),
  Profileservice.updateProfileService
);
usercontroller.get(
  "/listuser",
  authenticationMiddleware(),
  authorizationMiddleware(systemRoles.ADMIN),
  Profileservice.listUser
);
export default usercontroller;
