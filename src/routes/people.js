import { Router } from "express";

import { PAGES_PATH } from "../constants";

import PeopleModel from "../models/PeopleModel";
import UserModel from "../models/UserModel";

const router = Router();

function queryParser(req, res, next) {
  const MAX_PEOPLE = 50;

  let params = [];
  for (const prop in req.query) {
    if (prop == "page") {
      continue;
    }
    params.push(prop + "=" + req.query[prop]);
  }
  req.qstring = params.join("&");

  try {
    req.query.limit = req.query.limit || 15;
    req.query.limit = Number(req.query.limit);
    if (req.query.limit > MAX_PEOPLE) {
      req.query.limit = MAX_PEOPLE;
    }
  } catch {
    req.query.limit = 15;
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

function loadPeopleDatabase(req, res, next) {
  let query = {};
  if (req.query.name) {
    query.name = { $regex: ".*" + req.query.name + ".*", $options: "i" };
  }

  let startIndex = (req.query.page - 1) * req.query.limit;
  let amount = req.query.limit;
  PeopleModel.find(query)
    .limit(amount)
    .skip(startIndex)
    .exec(function (err, results) {
      if (err) {
        res.status(500).send("Error reading people.");
        console.log(err);
        return;
      }
      res.people = results;
      next();
      return;
    });
}

function respondPeople(req, res, next) {
  res.format({
    "application/json": () => {
      res.status(200).json(res.people);
    },
    "text/html": () => {
      res.render(`${PAGES_PATH}/people`, {
        people: res.people,
        qstring: req.qstring,
        current: req.query.page,
      });
    },
  });
  next();
}

const personById = async (req, res) => {
  const person = await PeopleModel.findOne({ _id: req.params.id }).populate(
    "directed wrote actedIn"
  );
  await PeopleModel.find({ _id: req.params.id });

  const collabArrSize = person.collaborators.size;
  let topCollabs = [];

  for (let i = collabArrSize; i > 0; i--) {
    person.collaborators
      .get(`${collabArrSize}`)
      .forEach((id) => topCollabs.push(id));
  }

  topCollabs = topCollabs.length < 5 ? topCollabs : topCollabs.slice(0, 5);

  topCollabs = await Promise.all(
    topCollabs.map(
      async (e) => await PeopleModel.findOne({ _id: e }).select("name")
    )
  );

  res.render(`${PAGES_PATH}/person`, { people: person, collabs: topCollabs });
};

async function followPerson(req, res, next) {
  const user = await UserModel.findOne({ _id: req.session.ownprofile._id });

  if (
    user.peopleFollowed.map((p) => p.toString()).includes(req.body.personID)
  ) {
    return res
      .status(405)
      .json({ success: false, message: "User follows this person already." });
  }

  await UserModel.updateOne(
    { _id: req.session.ownprofile._id },
    {
      $push: {
        peopleFollowed: req.body.personID,
      },
    }
  );
  return res.status(200).json({
    success: true,
    message: "User has succesfully followed this person",
  });
}

async function unfollowPerson(req, res, next) {
  const person = await PeopleModel.findOne({ _id: req.body.id });

  if (!person) {
    return res
      .status(404)
      .json({ message: "This person could not be found.", success: false });
  }

  const updatedModel = await UserModel.updateOne(
    { _id: req.session.ownprofile._id },
    {
      $pull: {
        peopleFollowed: person._id,
      },
    }
  );
  if (updatedModel.nModified === 0) {
    return res
      .status(405)
      .json({ message: "You do not follow this person.", success: false });
  }
  return res
    .status(200)
    .json({ success: true, message: "Person succesfully unfollowed." });
}

async function addPerson(req, res, next) {
  const personName = req.body.name;
  const person = await PeopleModel.findOne({ name: personName });
  if (person) {
    return res.status(405).json({
      success: false,
      message: "Person already exists in the database",
    });
  }
  const newPerson = new PeopleModel({
    name: personName,
    actedIn: [],
    wroteIn: [],
    directed: [],
    collaborators: new Map(),
  });
  await newPerson.save();
  return res
    .status(200)
    .json({ success: true, message: "New crew member succesfully added." });
}

router.patch("/follow", followPerson);
router.patch("/unfollow", unfollowPerson);

router.get("/:id", personById);
router.get("/", queryParser, loadPeopleDatabase, respondPeople);
router.post("/", addPerson);

export default router;
