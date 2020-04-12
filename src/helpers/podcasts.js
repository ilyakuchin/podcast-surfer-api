const axios = require('axios');
const xml2js = require('xml2js');

const API_URL = 'https://itunes.apple.com/search?media=podcast&term=';

function getEpisodes(item, url, podcastImageUrl) {
  return item
    .filter((i) => i.enclosure !== undefined)
    .map((i) => {
      let episodeUrl;
      if (i['itunes:image'] !== undefined) {
        episodeUrl = i['itunes:image'][0].$.href;
      } else {
        episodeUrl = podcastImageUrl;
      }

      return {
        id: i.guid[0]._,
        name: i.title[0],
        description: i.description[0].toString().replace(/(<([^>]+)>)/gi, ''),
        imageUrl: episodeUrl,
        audioUrl: i.enclosure[0].$.url,
        date: i.pubDate[0],
        podcastUrl: url,
      };
    });
}

function getPodcast(url) {
  return axios
    .get(url)
    .then((res) => {
      return xml2js.parseStringPromise(res.data);
    })
    .then((result) => {
      return {
        name: result.rss.channel[0].title[0],
        description: result.rss.channel[0].description
          .toString()
          .replace(/(<([^>]+)>)/gi, ''),
        imageUrl: result.rss.channel[0].image[0].url[0],
        episodes: getEpisodes(
          result.rss.channel[0].item,
          url,
          result.rss.channel[0].image[0].url[0]
        ),
        rss: url,
      };
    })
    .catch(() => {
      throw new Error('Server error');
    });
}

function getPodcasts(podcastName) {
  return axios
    .get(`${API_URL}${encodeURIComponent(podcastName)}`)
    .then((response) => {
      const podcastsInfo = [];
      for (let i = 0; i < response.data.results.length; i += 1) {
        podcastsInfo.push({
          id: response.data.results[i].collectionId.toString(),
          name: response.data.results[i].collectionName,
          imageUrl: response.data.results[i].artworkUrl600,
          rss: response.data.results[i].feedUrl,
        });
      }
      return podcastsInfo;
    })
    .catch(() => {
      throw new Error('Server error');
    });
}

module.exports = { getPodcast, getPodcasts };
