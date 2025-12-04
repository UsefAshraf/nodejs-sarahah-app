import { User } from "../DB/models/user.model.js";
import blackListTokens from "../DB/models/black-list-tokens.model.js";
import jwt from 'jsonwebtoken'
export const authenticationMiddleware = () => {
  return async (req, res, next) => {
    try {
        const {accesstoken} = req.headers;
        if(!accesstoken) return res.status(404).json({message:"error no token"});
        const decodedtoken = jwt.verify(accesstoken,process.env.JWT_SECRET_KEY || "jwtLoginSecretKey");
        const isTokenBlackListed = await blackListTokens.findOne({tokenId:decodedtoken.jti});
        if(isTokenBlackListed) return res.status(404).json({message:"this token is blacklisted"});

        const user = await User.findById(decodedtoken._id,'username email _id role');
        console.log(user);
        
        if(!user) return res.status(404).json({message:"error no user found"});

        req.loggedInUser = {...user._doc,token:{tokenId:decodedtoken.jti,expiryDate:decodedtoken.exp}};
        console.log(req.loggedInUser);
        

        next();
    } catch (error) {
      console.log("catch error from authentication middleware ", error);
      res.status(500).json({ message: "intenal server error", error });
    }
  };
};


export const authorizationMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    try {
        const {role} = req.loggedInUser;
        if(!role) return res.status(404).json({message:"error no role"});
        const isAllowed = allowedRoles.includes(role);
        if(!isAllowed) return res.status(401).json({message:"unauthorized"});
        next();
    } catch (error) {
      console.log("catch error from authorization middleware ", error);
      res.status(500).json({ message: "intenal server error", error });
    }
  };
};
