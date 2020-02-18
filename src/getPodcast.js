const axios = require('axios');
const xml2js = require('xml2js');

function getPodcast(url) {
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

function getEpisode(url, episodeId) {
  return getPodcast(url).then(res => {
    for (let i = 0; i < res.episodes.length; i++) {
      if (res.episodes[i].id === episodeId) {
        return res.episodes[i];
      }
    }
  });
}

module.exports = { getPodcast, getEpisode };
