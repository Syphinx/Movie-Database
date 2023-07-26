import express from "express";
import mongoose from "mongoose";
import session from "express-session";

import { PORT, PUBLIC_FOLDER, PAGES_PATH, MONGO_URI } from "./constants";

import MovieModel from "./models/MovieModel";
import UserModel from "./models/UserModel";
import movieRouter from "./routes/movies";
import peopleRouter from "./routes/people";
import userRouter from "./routes/users";
import contributeRouter from "./routes/contribute";
import reviewRouter from "./routes/reviews";
import notificationRouter from "./routes/notifications";

const app = express();

app.use(
  session({
    secret: "some secret here",
    resave: true,
    saveUninitialized: false,
  })
);

app.use(express.json());
app.set("view engine", "pug");
app.use(express.static(PUBLIC_FOLDER));

//LOGIN REQUESTS
app.post("/login", (req, res, next) => {
  if (req.session.loggedin == true) {
    res.status(200).json({ success: true, message: "Already logged in." });
  }
  let query = {};
  query.username = req.body.userName;
  query.password = req.body.password;

  UserModel.findOne(query, async function (err, result) {
    if (!result) {
      console.log("USER NOT FOUND!");
      return res
        .status(422)
        .json({ success: false, message: "User not found!" });
    } else {
      req.session.loggedin = true;
      req.session.ownprofile = result;
      req.session.recommended = [];
      res.status(200).json(result);
    }
  });
});

app.get("/signup", (req, res, next) => {
  res.render(`${PAGES_PATH}/signup`);
});

app.post("/signup", async (req, res, next) => {
  const newUser = new UserModel({
    username: req.body.userName,
    password: req.body.password,
  });

  try {
    req.session.loggedin = true;
    req.session.ownprofile = await newUser.save();
    req.session.recommended = [];
    res.status(200).json(req.session.ownprofile);
  } catch (err) {
    if (err.name === "MongoError" && err.code === 11000) {
      return res
        .status(422)
        .send({ success: false, message: "User already exist!" });
    }
    return res.status(422);
  }
  res.status(200).json(res.newUser);
});

app.use((req, res, next) => {
  if (!req.session.loggedin) {
    res.status(401);
    res.render(`${PAGES_PATH}/login`);
  }
  next();
});

app.get("/", async (_, res) => {
  let genres = [];
  genres = await MovieModel.distinct("genre");
  genres = genres.filter((genre) => genre !== "N/A");
  genres.unshift("All");
  res.render(`${PAGES_PATH}/index`, { Genres: genres });
});

//all requests once user is logged in
app.use("/movies", movieRouter);
app.use("/people", peopleRouter);
app.use("/users", userRouter);
app.use("/reviews", reviewRouter);
app.use("/contribute", contributeRouter);
app.use("/notifications", notificationRouter);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  app.listen(PORT);
  console.log(`Server ready at: http://127.0.0.1:${PORT}`);
});
