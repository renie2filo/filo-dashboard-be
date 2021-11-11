import express from 'express'
import UserModel from './schema.js'
import{ auth, adminOnly } from "../../utilities/auth/index.js"
import{ authenticate, refreshTokens } from "../../utilities/auth/tokenTools.js"

const router = express.Router()

router.route('/').post(async (req, res, next) => {
    try {
        const newUser = await new UserModel(req.body),
         {_id} = await newUser.save()
        res.send(newUser)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.route("/authorize").post(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByCredentials(email, password);
      const tokens = await authenticate(user);
      res.send(tokens);
    } catch (err) {
      console.log(err);
      next(err);
    }
  });
  
router.route("/first-authorize").post(async (req, res, next) => {
try {
    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email, password);
    const tokens = await authenticate(user);
    res.send(tokens);
} catch (err) {
    console.log(err);
    next(err);
}
});

router.route('/').get(auth, async (req, res, next) => {
    try {
        const user = await UserModel.find()
        res.send(user)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

export default router