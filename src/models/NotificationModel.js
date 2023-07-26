import { Schema, model } from "mongoose";

export const notificationSchema = new Schema({
  recievers: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
  movie: { type: Schema.Types.ObjectId, required: true, ref: "Movie" },
  type: { type: String, enum: ["movie", "review"] },
});

export default model("Notification", notificationSchema);
