import mongoose from "mongoose"
const {Schema} = mongoose
import {
    findMethod,
    jsonMethod,
    preSave,
    onlyEmailFind,
} from "../../utilities/auth/modelUtils.js";

const user_connection = mongoose.createConnection(process.env.MONGODB_USER)

const UserModel = new Schema(
  {
    password: { type: String },
    email: { type: String, required: true },
    refresh_tokens:[]
  }
);


onlyEmailFind(UserModel);
findMethod(UserModel);
jsonMethod(UserModel, ["password", "__v"]);
preSave(UserModel);

export default user_connection.model("user", UserModel);