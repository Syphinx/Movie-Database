import { Router } from "express";
import mongoose from "mongoose";
import { ObjectID } from "mongodb";

import { PAGES_PATH } from "../constants";

import ReviewModel from "../models/ReviewModel";
import UserModel from "../models/UserModel";
import NotificationModel from "../models/NotificationModel";

const router = Router();

router.post("/basic", addBasic);
router.post("/full", addFull);
router.get("/:id", sendReview);

async function addBasic(req, res) {
  const useroid = new ObjectID(req.session.ownprofile._id);
  const movieoid = new ObjectID(req.body.movieid);

  const basicReview = new ReviewModel({
    owner: useroid,
    postedOn: movieoid,
    score: req.body.score,
  });
  await basicReview.save();
  return res
    .status(200)
    .json({ success: true, message: "Review succesfully created" });
}

async function addFull(req, res) {
  const useroid = mongoose.Types.ObjectId(req.session.ownprofile._id);
  const movieoid = mongoose.Types.ObjectId(req.body.movieid);

  const fullReview = new ReviewModel({
    owner: useroid,
    postedOn: movieoid,
    score: req.body.score,
    reviewBody: {
      summary: req.body.summary,
      fullReview: req.body.full,
    },
  });

  await fullReview.save();

  let recievers = await UserModel.find({
    usersFollowed: { $all: [req.session.ownprofile._id] },
  });
  recievers = recievers.map((r) => r._id);

  if (recievers.length != 0) {
    const newNotification = new NotificationModel({
      recievers: recievers,
      movie: movieoid,
      type: "review",
    });
    await newNotification.save();
  }

  return res
    .status(200)
    .json({ success: true, message: "Review succesfully created" });
}

async function sendReview(req, res, next) {
  const reviewFound = await ReviewModel.findOne({
    _id: req.params.id,
  }).populate("owner postedOn");
  res.render(`${PAGES_PATH}/review`, { review: reviewFound });
}

export default router;
