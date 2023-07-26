import mongoose from "mongoose";

import { MONGO_URI } from "../constants";

import MovieModel from "../models/MovieModel";
import PeopleModel from "../models/PeopleModel";
import DATA from "../moviedata/movie-data-2500.json";

const peopleSet = new Set();

DATA.forEach((movie) => {
  movie["Writer"].forEach((name) => peopleSet.add(name));
  movie["Actors"].forEach((name) => peopleSet.add(name));
  movie["Director"].forEach((name) => peopleSet.add(name));
});

const totalPeople = peopleSet.size;
let finishedPeople = 0;
console.log(totalPeople);

/**
 *
 * @param {[string]} arrayOfNames
 * @param {string} fieldInPeopleModel
 * @param {string} fieldInMovieModel
 * @param {*} movieObject
 */
const addPeople = async (
  arrayOfNames,
  fieldInPeopleModel,
  fieldInMovieModel,
  movieObject
) => {
  Promise.allSettled(
    arrayOfNames.map(async (name) => {
      let person = await PeopleModel.findOne({ name });
      if (!person) {
        person = new PeopleModel({
          name,
          [fieldInPeopleModel]: [movieObject._id],
        });
      } else {
        person[fieldInPeopleModel].push(movieObject._id);
      }
      const savedPerson = await person.save();
      await movieObject[fieldInMovieModel].push(savedPerson._id);

      await movieObject.save(async function (err, callback) {
        finishedPeople++;

        if (finishedPeople % 250 == 0) {
          console.log("Finished person #" + finishedPeople + "/" + totalPeople);
        }
        if (finishedPeople == totalPeople) {
          // await PeopleModel.deleteOne({ name: "N/A" });
          // every person exists

          mongoose.connection.close();
          console.log("Finished.");
          console.log(`Succesfully adding: ${finishedPeople} people.`);
          // console.log("Successfully added: " + countSuccess);
          // console.log("Failed: " + countFail);
          process.exit(0);
        }
      });
    })
  );
};

const generateData = async () => {
  DATA.map(async (movie) => {
    const newMovie = new MovieModel({
      title: movie["Title"],
      releaseYear: movie["Year"],
      releaseDate: movie["Released"],
      rated: movie["Rated"],
      runtime: movie["Runtime"],
      genre: movie["Genre"],
      plot: movie["Plot"],
      poster: movie["Poster"],
    });
    const saveNewMovie = await newMovie.save();

    await addPeople(movie["Director"], "directed", "directors", saveNewMovie);

    await addPeople(movie["Actors"], "actedIn", "actors", saveNewMovie);

    await addPeople(movie["Writer"], "wrote", "writers", saveNewMovie);
  });
};

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  mongoose.connection.db.dropDatabase(function (err, result) {
    if (err) {
      console.log("Error dropping database:");
      console.log(err);
      return;
    }
    console.log("Dropped database. Starting re-creation.");
    generateData();
  });
});
