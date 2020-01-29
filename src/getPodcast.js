import axios from 'axios';
import xml2js from 'xml2js';

export function getPodcast(url) {
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
        episodes: getEpisodes(result.rss.channel[0].item),
        rss: url
      };
    });
}

function getEpisodes(item) {
  return item.map(i => {
    return {
      id: i.guid[0]['_'],
      name: i.title[0],
      description: i.description[0].toString().replace(/(<([^>]+)>)/gi, ''),
      imageUrl: i['itunes:image'][0]['$']['href'],
      audioUrl: i.enclosure[0]['$'].url
    };
  });
}

export function getEpisode(url, episodeId) {
  return getPodcast(url).then(res => {
    for (let i = 0; i < res.episodes.length; i++) {
      if (res.episodes[i].id === episodeId) {
        return res.episodes[i];
      }
    }
  });
}
