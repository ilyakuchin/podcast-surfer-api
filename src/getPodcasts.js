import axios from "axios";

const API_URL = "https://itunes.apple.com/search?media=podcast&term=";

export function getPodcasts(podcastName) {
  return axios
    .get(`${API_URL}${encodeURIComponent(podcastName)}`)
    .then(function(response) {
      let podcastsInfo = [];
      for (let i = 0; i < response.data.results.length; i++) {
        podcastsInfo.push({
          id: response.data.results[i].collectionId,
          name: response.data.results[i].collectionName,
          image: response.data.results[i].artworkUrl600,
          rss: response.data.results[i].feedUrl
        });
      }
      return podcastsInfo;
    });
}
