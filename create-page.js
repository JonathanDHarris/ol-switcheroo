const unescape = require('unescape');

const PROTOCOL = `http`;
const SERVER_EXTERNAL_ADDRESS = `localhost:3000`;
const maxCommentDepth = 5;

module.exports = {
	createPage: (posts, selfText, comments) => {
		let html = `<head>`
		html += `<script src=${PROTOCOL}://${SERVER_EXTERNAL_ADDRESS}/static/scripts/toggleComment.js></script>`
		html += `</head>`
		html += `${createBody(posts, selfText, comments)}`
		return html
	}
}

const createBody = (posts, selfText, comments) => {
	let html = `<body>`
	html += `<form action="/" method="GET"><input type="text" name="subreddit" id="subreddit-bar" value="" style="width: 50%;" autofocus /><br/></form>`
html += `<table><td valign="top" style="width:50%">${renderPosts(posts)}</td><td valign="top">${renderSelfText(selfText)}${renderComments( comments)}</td></table>`
	html += `</body>`
	return html;
}

const renderSelfText = selfText => {
	html = `<div>`
	html += unescape(selfText);
	html += `</div>`
	return html;
}

const renderComments = (comments, depth=1) => {
	if (!comments || depth > maxCommentDepth) {
		return `<div></div>`;
	}
	
	const margin = parseInt(depth, 10) * 10;
	let html = `<div style="margin-left:${margin}px">`;

	comments.forEach((comment, index) => {
		const backgroundColor = (index + depth) % 2 === 0 ? `lightgrey` : `lightslategrey`
		html += `<div id="comment_${comment.data.id}" onClick="event.stopPropagation(); toggleComment('${comment.data.id}')">`
		html += `<div style="background-color:${backgroundColor}">`
		html += '' + unescape(comment.data.body_html)
		html += `<i>${comment.data.author}</i>`
		html += `</div>`
		if (comment.data.replies && comment.data.replies.data && comment.data.replies.data.children) {
			const replies = renderComments(comment.data.replies.data.children, depth+1);
			html += replies;
		}
		html += `</div>`
		html += `<div style="background-color:${backgroundColor}; display:none" id="show_${comment.data.id}" onClick="event.stopPropagation(); toggleComment('${comment.data.id}')">Show comment</div>`
	})

	html += `</div>`
	
	return html;
}

const renderPosts = posts => {
	const lastPost = posts[posts.length-1];
	const {subredditLink, name} = lastPost;

	let html = `<ul>`
	posts.forEach(post => {
		html += renderPost(post)
	})
	
	html += `</ul>`
	
	html += `<a href=?subreddit=${subredditLink}&after=${name}>More</a>`;
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
	html += post.numComments
		? `<a href=?subreddit=${post.subredditLink}&comments=${post.comments}>${post.numComments} comments</a>`
		: `No Comments`
	html += `</li>`
	return html;
}