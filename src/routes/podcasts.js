const express = require('express');
const {
  getPodcasts,
  getPodcast,
  getTopPodcasts
} = require('../helpers/podcasts');

const podcasts = express.Router();

podcasts.get('/popular', (req, res) => {
  getTopPodcasts()
    .then(topPodcasts => {
      res.status(200).json([...topPodcasts]);
    })
    .catch(() => res.status(500).json({ message: 'Server error' }));
});

podcasts.get('/', (req, res) => {
  if (req.query.term && req.query.url) {
    res.status(400).json({ message: 'You can pass only one parameter' });
  } else if (req.query.term) {
    getPodcasts(req.query.term)
      .then(p => res.status(200).json(p))
      .catch(error => {
        if (error.message === 'Server error') {
          res.status(500).json({ message: 'Server error' });
        } else {
          res.status(404).json({ message: 'Not found' });
        }
      });
  } else if (req.query.url) {
    getPodcast(req.query.url)
      .then(podcast => res.status(200).json(podcast))
      .catch(error => {
        if (error.message === 'Server error') {
          res.status(500).json({ message: 'Server error' });
        } else {
          res.status(404).json({ message: 'Not found' });
        }
      });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

module.exports = podcasts;
