import { Schema, model } from "mongoose";

export const movieSchema = new Schema({
  title: { type: String, required: true },
  releaseYear: { type: String },
  releaseDate: { type: String },
  rated: { type: String },
  runtime: { type: String },
  genre: [{ type: String }],
  plot: { type: String },
  poster: { type: String },
  directors: [{ type: Schema.Types.ObjectId, ref: "People" }],
  writers: [{ type: Schema.Types.ObjectId, ref: "People" }],
  actors: [{ type: Schema.Types.ObjectId, ref: "People" }],
  reviews: [Schema.Types.ObjectId],
});

export default model("Movie", movieSchema);
