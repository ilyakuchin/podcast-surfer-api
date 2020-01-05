import express from "express";
import cors from "cors";
import { getPodcasts } from "./getPodcasts.js";
import { getPodcast } from "./getPodcast.js";

const PORT = 5000;

const app = express();

app.use(cors());

app.listen(process.env.PORT || PORT, () =>
  console.log(`podcast-api is running`)
);

app.get("/podcasts", (req, res) => {
  getPodcasts(req.query.name).then(podcasts => res.send(podcasts));
});

app.get("/podcast", (req, res) => {
  getPodcast(req.query.rss).then(podcast => res.send(podcast));
});
