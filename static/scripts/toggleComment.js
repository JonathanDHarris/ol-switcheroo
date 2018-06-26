const toggleComment = id => {
	const commentIsDisplay = document.getElementById(`comment_${id}`).style.display;
    
    if (commentIsDisplay === 'none') {
		document.getElementById(`comment_${id}`).style.display = 'block';
        document.getElementById(`show_${id}`).style.display = 'none';
    } else {
        document.getElementById(`comment_${id}`).style.display = 'none';
        document.getElementById(`show_${id}`).style.display = 'block';
    };
}