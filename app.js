const express = require('express');
const fetch = require('isomorphic-fetch');
const app = express();

const createPage = require('./create-page');

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
  
const MAIN = `https://www.reddit.com/`

const fetchUrl = async(url, subreddit, after) => {
	const fetchAfter = after ? after : 0;
	const fetchUrl = `${url}${subreddit}.json?after=${fetchAfter}`;
	const response = await fetch(fetchUrl);
	const responseJson = await response.json();
	return responseJson;
}

const fetchComments = async(commentUrl) => {
	const fetchUrl = `${MAIN}${commentUrl}.json`;
	const response = await fetch(fetchUrl);
	const responseJson = await response.json();
	return responseJson;
}

app.get('/', asyncMiddleware(async (req, res) => {
	const subreddit = req.query.subreddit && req.query.subreddit !== 'front_page' ? `r/${req.query.subreddit}` : '';
	const subredditLink = req.query.subreddit ? `${req.query.subreddit}` : 'front_page';
	const after = req.query.after ? req.query.after : '';
	const responseJson = await fetchUrl(MAIN, subreddit, after);
	
	const navigationData = {
		subredditLink,
		after,
		commentLink: req.query.comments
	}
	
	const children = responseJson.data.children;
	
	const posts = children.map(child => {
		return {
			subreddit: child.data.subreddit,
			subredditLink: subredditLink,
			title: child.data.title,
			comments: child.data.permalink,
			numComments: child.data.num_comments,
			url: child.data.url,
			name: child.data.name
		}
	})
	
	const commentsJson = req.query.comments
		? await fetchComments(req.query.comments)
		: null
		
	const comments = commentsJson
		? commentsJson[1].data.children
		: null
		
	const selfText = commentsJson
		? commentsJson[0].data.children[0].data.selftext_html
		: null
				
	res.send(createPage.createPage(posts, selfText, comments, navigationData));
}))

app.get('/static/scripts/toggleComment.js', (req, res) => {
	const fileName = `${__dirname}/static/scripts/toggleComment.js`
	res.sendFile(fileName);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))