const axios = require('axios');

const URL =
  'https://rss.itunes.apple.com/api/v1/us/podcasts/top-podcasts/all/10/explicit.json';

function getTopPodcasts() {
  return axios.get(URL).then(function(response) {
    const res = response.data.feed.results;
    let podcastsInfo = [];
    for (let i = 0; i < res.length; i++) {
      podcastsInfo.push({
        id: res[i].id.toString(),
        name: res[i].name,
        image: res[i].artworkUrl100,
        rss: res[i].url
      });
    }
    return podcastsInfo;
  });
}

module.exports = getTopPodcasts;
