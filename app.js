const express = require('express')
const fetch = require('isomorphic-fetch')
const app = express()

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
  

const MAIN = `https://www.reddit.com/`

const fetchUrl = async(url, limit, after) => {
	const fetchLimit = limit ? limmit : 10;
	const fetchAfter = after ? after : 0;
	const fetchUrl = `${url}.json?limit=${fetchLimit}&after=${fetchAfter}`;
	console.log(`Fetching ${fetchUrl}`);
	const response = await fetch(fetchUrl);
	const responseJson = await response.json();
	return responseJson;
}

app.get('/', asyncMiddleware(async (req, res) => {
	const responseJson = await fetchUrl(MAIN);
	// console.log(responseJson);
	
	const children = responseJson.data.children;
	
	const posts = children.map(child => {
		return {
			subreddit: child.data.subreddit,
			title: child.data.title,
			comments: child.data.permalink,
			url: child.data.url
		}
	})
	res.send(posts);
}))

app.listen(3000, () => console.log('Example app listening on port 3000!'))