import mongoose from "mongoose";

import { MONGO_URI } from "../constants";

import PeopleModel from "../models/PeopleModel";

const computeFreq = async () => {
  const people = await PeopleModel.find();
  const totalPeople = people.length;
  let finishedPeople = 0;
  people.forEach(async (person) => {
    const notMe = people.filter(({ _id }) => _id !== person._id);
    const moviesWorkedIn = [
      ...person.directed,
      ...person.wrote,
      ...person.actedIn,
    ].map((a) => a.toString());

    notMe.forEach(async (person2) => {
      const moviesWorkedIn2 = [
        ...person2.directed,
        ...person2.wrote,
        ...person2.actedIn,
      ].map((a) => a.toString());

      let freq = 0;
      moviesWorkedIn.forEach((m) => {
        if (moviesWorkedIn2.includes(m)) {
          freq++;
        }
      });

      if (freq > 0) {
        await PeopleModel.findByIdAndUpdate(
          { _id: person._id },
          {
            $push: {
              [`collaborators.${freq}`]: person2._id,
            },
          }
        ).exec(function (err, callback) {
          finishedPeople++;
          if (finishedPeople % 250 == 0) {
            console.log(
              "Finished person #" + finishedPeople + "/" + totalPeople
            );
          }
          if (finishedPeople == totalPeople) {
            mongoose.connection.close();
            console.log("Finished.");
            console.log(`Succesfully updated: ${finishedPeople} people.`);
            process.exit(0);
          }
        });
      }
    });
  });
};

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  computeFreq();
});
