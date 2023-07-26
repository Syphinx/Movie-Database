import { Router } from "express";

import { PAGES_PATH } from "../constants";

import UserModel from "../models/UserModel";

const router = Router();

router.get("/", authContributor, sendContributingPage);

async function authContributor(req, res, next) {
  const user = await UserModel.findById(req.session.ownprofile._id);

  if (!user.contributor) {
    res
      .status(401)
      .json({ success: false, message: "User is not a contributor" });
    return;
  }

  next();
}

function sendContributingPage(_, res) {
  res.render(`${PAGES_PATH}/contribute`);
}

export default router;
