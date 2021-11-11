import UserModel from "../../services/user/schema.js";
import { validateJWT } from "./tokenTools.js";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = await validateJWT(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET
    );
    const user = await UserModel.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error("NOT FOUND");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    const err = new Error("Please Authenticate");
    err.httpStatusCode = 401;
    next(err);
  }
};

const adminOnly = async (req, res, next) => {
  if (req.body.user && req.body.user.role === "admin") {
    next();
  } else {
    const err = new Error();
    err.httpStatusCode = 403;
    err.message = "FORBIDDEN - ADMIN ONLY";
    next(err);
  }
};

export {
  auth,
  adminOnly,
};