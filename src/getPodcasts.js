const axios = require('axios');

const API_URL = 'https://itunes.apple.com/search?media=podcast&term=';

function getPodcasts(podcastName) {
  return axios
    .get(`${API_URL}${encodeURIComponent(podcastName)}`)
    .then(function(response) {
      let podcastsInfo = [];
      for (let i = 0; i < response.data.results.length; i++) {
        podcastsInfo.push({
          id: response.data.results[i].collectionId.toString(),
          name: response.data.results[i].collectionName,
          imageUrl: response.data.results[i].artworkUrl600,
          rss: response.data.results[i].feedUrl
        });
      }
      return podcastsInfo;
    });
}

module.exports = getPodcasts;
