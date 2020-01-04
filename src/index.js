import express from "express";
import cors from "cors";
import { getPodcasts } from "./getPodcasts.js";

const PORT = 5000;

const app = express();

app.use(cors());

app.listen(PORT, () => console.log(`podcast-api is running on port ${PORT}`));

app.get("/podcasts", (req, res) => {
  getPodcasts(req.query.name).then(podcasts => res.send(podcasts));
});