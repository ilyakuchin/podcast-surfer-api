const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const URL =
  'https://rss.itunes.apple.com/api/v1/us/podcasts/top-podcasts/all/10/explicit.json';

function getTopPodcasts() {
  let podcastsInfo = [];
  let promises = [];
  return axios
    .get(URL)
    .then(function(response) {
      const res = response.data.feed.results;
      for (let i = 0; i < res.length; i++) {
        podcastsInfo.push({
          id: res[i].id.toString(),
          name: res[i].name,
          image: res[i].artworkUrl100,
          rss: null
        });
        promises.push(getFeedUrl(res[i].url));
      }
      return Promise.all(promises);
    })
    .then(res => {
      for (let i = 0; i < res.length; i++) {
        podcastsInfo[i].rss = res[i];
      }
      return podcastsInfo;
    });
}

function getFeedUrl(url) {
  return axios.get(url).then(res => {
    const dom = new JSDOM(res.data);
    let t = JSON.parse(
      dom.window.document.getElementById('shoebox-ember-data-store').text
    );
    return t.data.attributes.feedUrl;
  });
}

module.exports = getTopPodcasts;
