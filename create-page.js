const unescape = require('unescape');

const PROTOCOL = `http`;
const SERVER_EXTERNAL_ADDRESS = `localhost:3000`;
const maxCommentDepth = 5;

module.exports = {
	createPage: (posts, selfText, comments, navigationData) => {
		let html = `<head>`
		html += `<script src=${PROTOCOL}://${SERVER_EXTERNAL_ADDRESS}/static/scripts/toggleComment.js></script>`
		html += `</head>`
		html += `${createBody(posts, selfText, comments, navigationData)}`
		return html
	}
}

const createBody = (posts, selfText, comments, navigationData) => {
	let html = `<body>`
	html += `<form action="/" method="GET"><input type="text" name="subreddit" id="subreddit-bar" value="" style="width: 50%;" autofocus /><br/></form>`
	html += `<table><td valign="top" style="width:50%">${renderPosts(posts, navigationData)}</td><td valign="top">${renderSelfText(selfText)}${renderComments(comments, navigationData)}</td></table>`
	html += `</body>`
	return html;
}

const renderSelfText = selfText => {
	html = `<div>`
	html += unescape(selfText);
	html += `</div>`
	return html;
}

const renderComments = (comments, navigationData, depth=1) => {
	const { after, subredditLink, commentLink } = navigationData;
	if (!comments || depth > maxCommentDepth) {
		return `<div></div>`;
	}
	
	const margin = parseInt(depth, 10) * 10;
	let html = `<div style="margin-left:${margin}px">`;

	comments.forEach((comment, index) => {
		const backgroundColor = (index + depth) % 2 === 0 ? `lightgrey` : `lightslategrey`;
		
		if (comment.kind !== 'more') {
			html += `<div id="comment_${comment.data.id}" onClick="event.stopPropagation(); toggleComment('${comment.data.id}')">`
			html += `<div style="background-color:${backgroundColor}">`
			html += '' + unescape(comment.data.body_html)
			html += `<i>${comment.data.author}</i>`
			html += `</div>`
			if (comment.data.replies && comment.data.replies.data && comment.data.replies.data.children) {
				const replies = renderComments(comment.data.replies.data.children, navigationData, depth+1);
				html += replies;
			}
			html += `</div>`
			html += `<div style="background-color:${backgroundColor}; display:none" id="show_${comment.data.id}" onClick="event.stopPropagation(); toggleComment('${comment.data.id}')">Show comment</div>`
		}
	})

	html += `</div>`
	
	return html;
}

const renderPosts = (posts, navigationData) => {
	const lastPost = posts[posts.length-1];
	const {name} = lastPost;
	const { subredditLink } = navigationData;

	let html = `<ul>`
	posts.forEach(post => {
		html += renderPost(post, navigationData)
	})
	
	html += `</ul>`
	
	html += `<a href=?subreddit=${subredditLink}&after=${name}>More</a>`;
	return html;
}

const renderPost = (post, navigationData) => {
	const { after, subredditLink } = navigationData;
	
	let html = `<li>`
	html += `<b><a href=${post.url}>${post.title}</a></b>`
	if (post.subreddit) {
		html += `</br>`
		html += `<span>${post.subreddit}</span>`
	}
	html += `</br>`
	html += post.numComments
		? `<a href=?subreddit=${subredditLink}&after=${after}&comments=${post.comments}>${post.numComments} comments</a>`
		: `No Comments`
	html += `</li>`
	return html;
}