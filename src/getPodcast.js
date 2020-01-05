import axios from "axios";
import xml2js from "xml2js";

export function getPodcast(url) {
  return axios
    .get(url)
    .then(res => {
      return xml2js.parseStringPromise(res.data);
    })
    .then(result => {
      return {
        name: result.rss.channel[0].title,
        description: result.rss.channel[0].description,
        image: result.rss.channel[0].image[0].url,
        episodes: getEpisodes(result.rss.channel[0].item)
      };
    });
}

function getEpisodes(item) {
  console.log(item);
  return item.map(i => {
    return {
      id: i.guid[0]["_"],
      name: i.title[0],
      description: i.description[0],
      image: i["itunes:image"][0]["$"]["href"]
    };
  });
}
