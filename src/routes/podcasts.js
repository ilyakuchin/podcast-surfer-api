const express = require('express');
const {
  getPodcasts,
  getPodcast,
  getTopPodcasts
} = require('../helpers/podcasts.js');

const podcasts = express.Router();

podcasts.get('/popular', (req, res) => {
  getTopPodcasts().then(topPodcasts => {
    res.status(200).json([...topPodcasts]);
  });
});

podcasts.get('/', (req, res) => {
  if (req.query.term && req.query.url) {
    res.status(400).json({ message: 'you can pass only one parameter' });
  } else if (req.query.term) {
    getPodcasts(req.query.term).then(podcasts =>
      res.status(200).json(podcasts)
    );
  } else if (req.query.url) {
    getPodcast(req.query.url).then(podcast => res.status(200).json(podcast));
  } else {
    res.status(404).json({ message: 'not found or query is incorrect' });
  }
});

module.exports = podcasts;
