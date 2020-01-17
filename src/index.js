import express from "express";
import cors from "cors";
import { getPodcasts } from "./getPodcasts.js";
import { getPodcast } from "./getPodcast.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import User from "./models/user.js";
import bcrypt from "bcrypt";

const PORT = 5000;
mongoose.connect("mongodb://localhost:27017/podcast-player");
let db = mongoose.connection;
db.on("error", err => console.log(err));
db.once("open", () => console.log("connected to db"));

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.listen(PORT, () => console.log(`podcast-api is running on port ${PORT}`));

app.get("/podcasts", (req, res) => {
  getPodcasts(req.query.name).then(podcasts => res.send(podcasts));
});

app.get("/podcast", (req, res) => {
  getPodcast(req.query.rss).then(podcast => res.send(podcast));
});

app.post("/register", (req, res) => {
  const saltRounds = 10;

  bcrypt.genSalt(saltRounds, (err, salt) =>
    bcrypt.hash(req.body.password, salt, (err, hash) => {
      const user = new User({
        username: req.body.username,
        password: hash
      });
      user.save(err => {
        if (err) {
          res.sendStatus(400);
        } else {
          res.sendStatus(200);
        }
      });
    })
  );
});

app.post("/login", (req, res) => {
  User.findOne({ username: req.body.username }, (err, obj) => {
    bcrypt.compare(req.body.password, obj.password, (err, r) => {
      if (r === true) {
        res.sendStatus(200);
      } else {
        res.sendStatus(401);
      }
    });
  });
});
