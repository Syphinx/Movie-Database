import { Router } from "express";

import NotificationModel from "../models/NotificationModel";
import UserModel from "../models/UserModel";

const router = Router();

router.patch("/remove", removeFromNotif);

async function removeFromNotif(req, res, next) {
  const user = await UserModel.findOne({ _id: req.session.ownprofile._id });

  if (!user) {
    return res
      .status(404)
      .json({ message: "This user could not be found.", success: false });
  }

  const updatedModel = await NotificationModel.updateOne(
    { _id: req.body.id },
    { $pull: { recievers: user._id } }
  );

  if (updatedModel.nModified === 0) {
    return res
      .status(405)
      .json({ message: "Movie is not in your watchlist", success: false });
  }

  const notif = await NotificationModel.findOne({ _id: req.body.id });

  if (notif.recievers.length == 0) {
    await NotificationModel.deleteOne({ _id: notif._id });
  }

  return res.status(200).json({
    message: "User succesfully removed from this notification.",
    success: true,
  });
}

export default router;
