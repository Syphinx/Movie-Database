import { Router } from "express";

import { PAGES_PATH } from "../constants";

import ReviewModel from "../models/ReviewModel";
import MovieModel from "../models/MovieModel";
import UserModel from "../models/UserModel";
import NotificationModel from "../models/NotificationModel";

const router = Router();

async function userById(req, res) {
  const user = await UserModel.findOne({ _id: req.params.id }).populate(
    "watchlist",
    MovieModel
  );

  const reviews = await ReviewModel.find({ owner: user._id }).populate(
    "postedOn"
  );
  const fullReviews = reviews.filter((r) => r.reviewBody.summary);

  res.render(`${PAGES_PATH}/ownprofile`, {
    account: user,
    recommended: [],
    reviews: fullReviews,
    me: false,
  });
}

async function sendOwnProfile(req, res) {
  const user = await UserModel.findOne({
    _id: req.session.ownprofile._id,
  }).populate("watchlist", MovieModel);

  const reviews = await ReviewModel.find({ owner: user._id }).populate(
    "postedOn"
  );
  const fullReviews = reviews.filter((r) => r.reviewBody.summary);

  const newNotifcations = await NotificationModel.find({
    recievers: { $all: [user._id] },
  }).populate("movie person user");
  console.log(newNotifcations);

  res.render(`${PAGES_PATH}/ownprofile`, {
    account: user,
    recommended: req.session.recommended,
    reviews: fullReviews,
    notifications: newNotifcations,
    me: true,
  });
}

function logout(req, res) {
  req.session.loggedin = false;
  req.session.ownprofile = undefined;
  res.redirect(307, "/");
}

async function changeUserStatus(req, res, next) {
  const user = await UserModel.findOne({ _id: req.session.ownprofile._id });

  if (req.body.regButton && !user.contributor) {
    //Trying to change to a regular user when you are already a regular user
    return res
      .status(405)
      .json({ success: false, message: "User is already a regular user." });
  }
  if (req.body.conButton && user.contributor) {
    //Trying to change to a contributor user when you are already a contributor user
    return res.status(405).json({
      success: false,
      message: "User is already a contributing user.",
    });
  }
  if (req.body.conButton && !user.contributor) {
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { contributor: true } }
    );
    return res.status(200).json({
      success: true,
      message: "Succesfully updated contributor status.",
    });
  }
  if (req.body.regButton && user.contributor) {
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { contributor: false } }
    );
    return res.status(200).json({
      success: true,
      message: "Succesfully updated contributor status.",
    });
  }
}

async function addWatchlist(req, res, next) {
  const movie = await MovieModel.findOne({ _id: req.body.id });

  if (!movie) {
    return res
      .status(404)
      .json({ message: "This movie could not be found.", success: false });
  }

  const updatedModel = await UserModel.updateOne(
    { _id: req.session.ownprofile._id },
    { $addToSet: { watchlist: movie._id } }
  );

  if (updatedModel.nModified === 0) {
    return res
      .status(405)
      .json({ message: "Movie is already in your watchlist", success: false });
  }

  return res
    .status(200)
    .json({ message: "Movie Succesfully added to watchlist.", success: true });
}

async function deleteWatchList(req, res, next) {
  const movie = await MovieModel.findOne({ _id: req.body.id });

  if (!movie) {
    return res
      .status(404)
      .json({ message: "This movie could not be found.", success: false });
  }

  const updatedModel = await UserModel.updateOne(
    { _id: req.session.ownprofile._id },
    { $pull: { watchlist: movie._id } }
  );

  if (updatedModel.nModified === 0) {
    return res
      .status(405)
      .json({ message: "Movie is not in your watchlist", success: false });
  }

  return res.status(200).json({
    message: "Movie Succesfully removed from watchlist.",
    success: true,
  });
}

async function followUser(req, res, next) {
  const user = await UserModel.findOne({ _id: req.session.ownprofile._id });

  if (user.usersFollowed.map((u) => u.toString()).includes(req.body.id)) {
    return res
      .status(405)
      .json({ success: false, message: "User follows this user already." });
  }

  await UserModel.updateOne(
    { _id: req.session.ownprofile._id },
    {
      $push: {
        usersFollowed: req.body.id,
      },
    }
  );
  return res.status(200).json({
    success: true,
    message: "User has succesfully followed this user.",
  });
}

async function unfollowUser(req, res, next) {
  const otherUser = await UserModel.findOne({ _id: req.body.id });
  if (!otherUser) {
    return res
      .status(404)
      .json({ message: "This user could not be found.", success: false });
  }

  const updatedModel = await UserModel.updateOne(
    { _id: req.session.ownprofile._id },
    { $pull: { usersFollowed: otherUser._id } }
  );

  if (updatedModel.nModified === 0) {
    return res
      .status(405)
      .json({ message: "You do not follow this user.", success: false });
  }
  return res.status(200).json({
    message: "User Succesfully unfollowed.",
    success: true,
  });
}

async function sendOwnSubscriptions(req, res, next) {
  const user = await UserModel.findOne({
    _id: req.session.ownprofile._id,
  }).populate("usersFollowed peopleFollowed");
  res.render(`${PAGES_PATH}/subscriptions`, { account: user, me: true });
}

async function sendUserSubscriptions(req, res, next) {
  const user = await UserModel.findOne({ _id: req.params.id }).populate(
    "usersFollowed peopleFollowed"
  );
  res.render(`${PAGES_PATH}/subscriptions`, { account: user, me: false });
}

router.patch("/follow", followUser);
router.patch("/unfollow", unfollowUser);
router.patch("/watchlist/add", addWatchlist);
router.patch("/watchlist/remove", deleteWatchList);
router.patch("/", changeUserStatus);

router.get("/logout", logout);
router.get("/ownprofile", sendOwnProfile);
router.get("/ownprofile/subscriptions", sendOwnSubscriptions);
router.get("/:id/subscriptions", sendUserSubscriptions);
router.get("/:id", userById);

export default router;
