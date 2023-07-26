import { Schema, model } from "mongoose";

export const peopleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  directed: [{ type: Schema.Types.ObjectId, ref: "Movie" }],
  wrote: [{ type: Schema.Types.ObjectId, ref: "Movie" }],
  actedIn: [{ type: Schema.Types.ObjectId, ref: "Movie" }],

  collaborators: {
    type: Map,
    of: [{ type: Schema.Types.ObjectId, ref: "People" }],
  },

  followers: [Schema.Types.ObjectId],
});

export default model("People", peopleSchema);
