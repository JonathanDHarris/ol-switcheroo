const express = require('express')
const fetch = require('isomorphic-fetch')
const unescape = require('unescape')
const app = express()

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };
  
const createPage = (posts, comments) => {
	return `<head>${createBody(posts, comments)}</head>`
}

const createBody = (posts, comments) => {
	return `<body><table><td valign="top " style="width:50%">${renderPosts(posts)}</td><td valign="bottom">${renderComments(comments)}</td></table></body>`
}

const renderComments = (comments, depth=1) => {
	if (!comments || depth > maxCommentDepth) {
		return;
	}
	
	const margin = parseInt(depth, 10) * 10;
	let html = `<div style="margin-left:${margin}px">`;

	comments.forEach(comment => {
		html += '' + unescape(comment.data.body_html)
		html += `<i>${comment.data.author}</i>`
		html += `</br>`
		if (comment.data.replies && comment.data.replies.data && comment.data.replies.data.children) {
			const replies = renderComments(comment.data.replies.data.children, depth+1);
			html += replies;
		}
	})

	html += `</div>`
	
	return html;
}

const renderPosts = posts => {

	let html = `<ul>`
	posts.forEach(post => {
		html += renderPost(post)
	})
	
	html += `</ul>`
	return html;
}

const renderPost = post => {
	let html = `<li>`
	html += `<b><a href=${post.url}>${post.title}</a></b>`
	if (post.subreddit) {
		html += `</br>`
		html += `<span>${post.subreddit}</span>`
	}
	html += `</br>`
	html += `<a href=?subreddit=${post.subredditLink}&comments=${post.comments}>comments</a>`
	html += `</li>`
	return html;
}

const MAIN = `https://www.reddit.com/`

const maxCommentDepth = 5;

const fetchUrl = async(url, subreddit, limit, after) => {
	const fetchLimit = limit ? limmit : 10;
	const fetchAfter = after ? after : 0;
	const fetchUrl = `${url}${subreddit}.json?limit=${fetchLimit}&after=${fetchAfter}`;
	console.log(`Fetching ${fetchUrl}`);
	const response = await fetch(fetchUrl);
	const responseJson = await response.json();
	return responseJson;
}

const fetchComments = async(commentUrl) => {
	const fetchUrl = `${MAIN}${commentUrl}.json`;
	console.log(`Fetching ${fetchUrl}`);
	const response = await fetch(fetchUrl);
	const responseJson = await response.json();
	return responseJson;
}

app.get('/', asyncMiddleware(async (req, res) => {
	const subreddit = req.query.subreddit && req.query.subreddit !== 'front_page' ? `r/${req.query.subreddit}` : '';
	const subredditLink = req.query.subreddit ? `${req.query.subreddit}` : 'front_page';
	const responseJson = await fetchUrl(MAIN, subreddit);
	
	const children = responseJson.data.children;
	
	const posts = children.map(child => {
		return {
			subreddit: child.data.subreddit,
			subredditLink: subredditLink,
			title: child.data.title,
			comments: child.data.permalink,
			url: child.data.url
		}
	})
	
	const commentsJson = req.query.comments
		? await fetchComments(req.query.comments)
		: null
		
	const comments = commentsJson
		? commentsJson[1].data.children
		: null
	res.send(createPage(posts, comments));
}))

app.listen(3000, () => console.log('Example app listening on port 3000!'))