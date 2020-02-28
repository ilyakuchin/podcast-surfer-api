const axios = require('axios');
const xml2js = require('xml2js');
const API_URL = 'https://itunes.apple.com/search?media=podcast&term=';
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const URL =
  'https://rss.itunes.apple.com/api/v1/us/podcasts/top-podcasts/all/10/explicit.json';

function getPodcast(url) {
  console.log('getpodcast');
  console.log(`url=${url}`);
  return axios
    .get(url)
    .then(res => {
      return xml2js.parseStringPromise(res.data);
    })
    .then(result => {
      return {
        name: result.rss.channel[0].title[0],
        description: result.rss.channel[0].description
          .toString()
          .replace(/(<([^>]+)>)/gi, ''),
        imageUrl: result.rss.channel[0].image[0].url[0],
        episodes: getEpisodes(result.rss.channel[0].item, url),
        rss: url
      };
    })
    .catch(err => console.log(err.message));
}

function getEpisodes(item, url) {
  return item.map(i => {
    return {
      id: i.guid[0]['_'],
      name: i.title[0],
      description: i.description[0].toString().replace(/(<([^>]+)>)/gi, ''),
      imageUrl: i['itunes:image'][0]['$']['href'],
      audioUrl: i.enclosure[0]['$'].url,
      date: i.pubDate[0],
      podcastUrl: url
    };
  });
}

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
          imageUrl: res[i].artworkUrl100,
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

module.exports = { getPodcast, getPodcasts, getTopPodcasts };
