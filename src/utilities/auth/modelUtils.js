import bcrypt from "bcryptjs";

const onlyEmailFind = (userModel) => {
  return (userModel.statics.findByEmail = async function (email, password) {
    const user = await this.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      } else {
        return null;
      }
    } else {
      return null;
    }
  });
};

const findMethod = (userModel) => {
  return (userModel.statics.findByCredentials = async function (
    email,
    password
  ) {
    const user = await this.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      } else {
        return null;
      }
    } else {
      return null;
    }
  });
};

const jsonMethod = (userModel, properties) => {
  return (userModel.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject();

    properties.forEach((property) => delete userObj[property]);

    return userObj;
  });
};

const preSave = (userModel) => {
  return userModel.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    next();
  });
};

export { findMethod, jsonMethod, preSave, onlyEmailFind };