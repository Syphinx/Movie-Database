import { Router } from "express";
import mongoose from "mongoose";

import { PAGES_PATH } from "../constants";

import PeopleModel from "../models/PeopleModel";
import MovieModel from "../models/MovieModel";
import ReviewModel from "../models/ReviewModel";
import UserModel from "../models/UserModel";
import NotificationModel from "../models/NotificationModel";

const router = Router();

router.get("/:id", movieById);
router.get("/", queryParser, loadMovieDatabase, respondMovies);
router.post("/", addMovie);

function queryParser(req, res, next) {
  const MAX_MOVIES = 50;
  let params = [];
  for (const prop in req.query) {
    if (prop == "page") {
      continue;
    }
    params.push(prop + "=" + req.query[prop]);
  }
  req.qstring = params.join("&");

  try {
    req.query.limit = req.query.limit || 16;
    req.query.limit = Number(req.query.limit);
    if (req.query.limit > MAX_MOVIES) {
      req.query.limit = MAX_MOVIES;
    }
  } catch {
    req.query.limit = 16;
  }

  try {
    req.query.page = req.query.page || 1;
    req.query.page = Number(req.query.page);
    if (req.query.page < 1) {
      req.query.page = 1;
    }
  } catch {
    req.query.page = 1;
  }
  next();
}

function loadMovieDatabase(req, res, next) {
  let startIndex = (req.query.page - 1) * req.query.limit;
  let amount = req.query.limit;

  let query = {};
  if (req.query.title) {
    query.title = { $regex: ".*" + req.query.title + ".*", $options: "i" };
  }

  if (req.query.genre && req.query.genre != "All") {
    query.genre = { $regex: ".*" + req.query.genre + ".*", $options: "i" };
  }

  MovieModel.find(query)
    .limit(amount)
    .skip(startIndex)
    .populate("actors", PeopleModel)
    .exec(function (err, results) {
      if (err) {
        res.status(500).send("Error reading movies.");
        console.log(err);
        return;
      }

      if (req.query.actorName) {
        res.movies = [];
        for (let i = 0; i < results.length; i++) {
          for (let j = 0; j < results[i].actors.length; j++) {
            if (
              results[i].actors[j].name
                .toLowerCase()
                .includes(req.query.actorName.toLowerCase())
            ) {
              res.movies.push(results[i]);
            }
          }
        }
      } else {
        res.movies = results;
      }
      next();
      return;
    });
}

function respondMovies(req, res, next) {
  res.format({
    "application/json": () => {
      res.status(200).json(res.movies);
    },
    "text/html": () => {
      res.render(`${PAGES_PATH}/movies`, {
        movies: res.movies,
        qstring: req.qstring,
        current: req.query.page,
      });
    },
  });
  next();
}

async function movieById(req, res) {
  const movieFound = await MovieModel.findOne({ _id: req.params.id }).populate(
    "directors writers actors",
    PeopleModel
  );

  if (!movieFound) {
    return res.status(404);
  }

  const reviews = await ReviewModel.find({ postedOn: movieFound._id }).populate(
    "owner"
  );
  const fullReviews = reviews.filter((r) => r.reviewBody.summary);

  let averageRating = "N/A";
  if (reviews.length != 0) {
    averageRating = (
      reviews.map((a) => a.score).reduce((a, b) => a + b) / reviews.length
    ).toPrecision(2);
  }

  const MAX_SIMILAR = 8;

  //Finding the movies with most genre matches
  let mostSimilar = await MovieModel.find({
    genre: { $all: movieFound.genre },
    _id: { $ne: movieFound._id },
  });

  //finding a random genre for which to match the remaining 'similar movies'
  if (mostSimilar.length < MAX_SIMILAR) {
    const removeIds = mostSimilar.map((m) => m._id.toString());
    let searchGenre =
      movieFound.genre[Math.floor(Math.random() * movieFound.genre.length)];
    console.log(searchGenre);
    if (!searchGenre) {
      let genres = await MovieModel.distinct("genre");
      //News and Short are removed, because they have too small a sample of movies to select from an cause unexpected behaviour within the program.
      genres = genres.filter(
        (genre) => genre !== "N/A" && genre !== "News" && genre !== "Short"
      );
      searchGenre = genres[Math.floor(Math.random() * genres.length)];
      console.log(genres);
    }

    let lessSimilar = await MovieModel.find({
      genre: { $all: [searchGenre] },
      _id: { $ne: movieFound._id },
    });

    removeIds.forEach((id) => {
      lessSimilar = lessSimilar.filter((m) => m._id.toString() !== id);
    });

    const needTheseMany = MAX_SIMILAR - mostSimilar.length;

    const randomSpots = new Set();

    while (randomSpots.size < needTheseMany) {
      randomSpots.add(Math.floor(Math.random() * lessSimilar.length));
    }
    [...randomSpots].forEach((i) => {
      mostSimilar.push(lessSimilar[i]);
    });
  }

  mostSimilar = mostSimilar.slice(0, MAX_SIMILAR);

  //ATTACH SIMILAR MOVIES TO SESSION TO DISPLAY RECOMMENDED MOVIES TO USER
  req.session.recommended = mostSimilar.slice(0, 4);

  res.render(`${PAGES_PATH}/movie`, {
    movie: movieFound,
    reviews: fullReviews,
    rating: averageRating,
    similar: mostSimilar,
  });
}

async function addMovie(req, res, next) {
  const movie = await MovieModel.findOne({ title: req.body.title });
  if (movie) {
    return res.status(405).json({
      success: false,
      message: "Movie with that title already exists in the database",
    });
  }

  let writers = await Promise.all(
    req.body.writers.map(async (w) => await PeopleModel.findOne({ name: w }))
  );
  let actors = await Promise.all(
    req.body.actors.map(async (a) => await PeopleModel.findOne({ name: a }))
  );
  let directors = await Promise.all(
    req.body.directors.map(async (d) => await PeopleModel.findOne({ name: d }))
  );

  const people = [...writers, ...actors, ...directors];

  //Updating Collabs
  people.forEach((person1) => {
    const notMe = people.filter((p) => p._id !== person1._id);
    notMe.forEach((person2) => {
      let prevCollab = false;
      for (let i = 1; i <= person1.collaborators.size; i++) {
        if (
          person1.collaborators.get(`${i}`).includes(person2._id.toString())
        ) {
          person1.collaborators.set(
            `${i}`,
            person1.collaborators
              .get(`${i}`)
              .filter((id) => id.toString() != person2._id.toString())
          );
          if (i + 1 <= person1.collaborators.size) {
            let a = person1.collaborators.get(`${i + 1}`);
            a.push(person2._id.toString());
            person1.collaborators.set(`${i + 1}`, a);
          } else {
            person1.collaborators.set(`${i + 1}`, [person2._id.toString()]);
          }
          prevCollab = true;
          break;
        }
      }
      if (!prevCollab) {
        if (person1.collaborators.get("1")) {
          let p = person1.collaborators.get("1");
          p.push(person2._id.toString());
          person1.collaborators.set("1", p);
        } else {
          person1.collaborators.set("1", [person2._id.toString()]);
        }
      }
    });
  });

  const newMovie = new MovieModel({
    title: req.body.title,
    releaseYear: req.body.releaseYear,
    runtime: req.body.runtime,
    actors: actors.map((a) => a._id),
    writers: writers.map((m) => m._id),
    directors: directors.map((d) => d._id),
  });

  const savedMovie = await newMovie.save();

  people.forEach(async (p) => {
    await PeopleModel.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(p._id) },
      {
        $set: {
          collaborators: p.collaborators,
        },
      }
    );
  });

  let recievers = await Promise.all(
    people.map(
      async (p) =>
        await UserModel.findOne({
          peopleFollowed: { $all: [p._id.toString()] },
        })
    )
  );
  recievers = recievers.filter(Boolean);

  if (recievers.length !== 0) {
    let newNotification = new NotificationModel({
      recievers: recievers.map((u) => u._id),
      movie: savedMovie._id,
      type: "movie",
    });
    newNotification.save();
  }

  writers.forEach(async (w) => {
    await PeopleModel.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(w._id) },
      {
        $push: {
          wrote: mongoose.Types.ObjectId(savedMovie._id),
        },
      }
    );
  });

  actors.forEach(async (a) => {
    await PeopleModel.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(a._id) },
      {
        $push: {
          actedIn: mongoose.Types.ObjectId(savedMovie._id),
        },
      }
    );
  });

  directors.forEach(async (d) => {
    await PeopleModel.findByIdAndUpdate(
      { _id: mongoose.Types.ObjectId(d._id) },
      {
        $push: {
          directed: mongoose.Types.ObjectId(savedMovie._id),
        },
      }
    );
  });

  return res
    .status(200)
    .json({ success: true, message: "New movie succesfully added." });
}

export default router;
