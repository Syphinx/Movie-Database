import { Schema, model } from "mongoose";

export const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contributor: { type: Boolean, default: false },
  peopleFollowed: [{ type: Schema.Types.ObjectId, ref: "People" }],
  usersFollowed: [{ type: Schema.Types.ObjectId, ref: "User" }],
  watchlist: [{ type: Schema.Types.ObjectId, ref: "Movie" }],
});

export default model("User", userSchema);
