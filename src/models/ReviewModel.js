import { Schema, model } from "mongoose";

export const reviewSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  postedOn: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
  score: { type: Number, required: true },
  reviewBody: {
    summary: { type: String },
    fullReview: { type: String },
  },
});

export default model("Review", reviewSchema);
