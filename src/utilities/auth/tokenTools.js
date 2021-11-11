import jwt from "jsonwebtoken";
import UserModel from "../../services/user/schema.js";

const generateJWT = (payload, secret) =>
  new Promise((res, rej) =>
    jwt.sign(
      payload,
      secret,
      {
        expiresIn: secret === process.env.JWT_ACCESS_TOKEN_SECRET ? "1h" : "2h",
      },
      (err, token) => {
        if (err) rej(err);
        res(token);
      }
    )
  );

const validateJWT = (token, secret) =>
  new Promise((res, rej) =>
    jwt.verify(token, secret, (err, decoded) => {
      if (err) rej(err);
      res(decoded);
    })
  );

const authenticate = async (user) => {
  // console.log(user._id);
  try {
    const access_token = await generateJWT(
      { _id: user._id },
      process.env.JWT_ACCESS_TOKEN_SECRET
    );
    const refresh_token = await generateJWT(
      { _id: user._id },
      process.env.JWT_REFRESH_TOKEN_SECRET
    );
    user.refresh_tokens = user.refresh_tokens.concat({ refresh_token });
    await user.save();
    return { access_token, refresh_token };
  } catch (error) {
    console.log(error);
    // next(error);
  }
};

const refreshTokens = async (oldRefreshToken) => {
  const decoded = await generateJWT(
    oldRefreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET
  );

  const user = await UserModel.findOne({ _id: decoded._id });

  if (!user) {
    throw new Error("Access Forbidden");
  }

  const currentRefreshToken = user.refresh_tokens.find(
    (token) => token.token === oldRefreshToken
  );

  if (!currentRefreshToken) {
    throw new Error("Wrong Refresh Token");
  }

  const access_token = await generateJWT(
    { _id: user._id },
    process.env.JWT_ACCESS_TOKEN_SECRET
  );
  const refresh_token = await generateJWT(
    { _id: user._id },
    process.env.JWT_REFRESH_TOKEN_SECRET
  );

  const newRefreshTokens = user.refresh_tokens
    .filter((token) => token.token !== oldRefreshToken)
    .concat({ token: refresh_token });

  user.refresh_tokens = [...newRefreshTokens];
  await user.save();

  return { access_token, refresh_token };
};

export { authenticate, validateJWT, refreshTokens };