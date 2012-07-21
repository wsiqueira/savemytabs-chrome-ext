// SAVE MY TABS
chrome.tabs.getAllInWindow(null, function(tabs) {
	
	var tabs_html = '';
	tabs.forEach(function(tab){
		if(tab.pinned || !Tabs.isUrl(tab.url)) return;
		tabs_html +='<li><label><input type="checkbox" class="link" checked="checked"/><a href="'+ tab.url + '">' + tab.title + '</a></label></li>';
	});
	
	urlList.innerHTML = tabs_html;
});

var $ = function(e){

	var el = window[e];
	
	if(el.length == 0){
		el = document.querySelectorAll(e);
	}
	//console.log(el);

	el.bind = function(event, func){
		this.addEventListener(event, func);
	}
	
	return el;
}

var Tabs = function(){};

Tabs.configAddToBookmark = function(e){
	Tabs.notification('info', "Select a destination folder");
	bookmark.style.display = "block";
};

Tabs.cancelAddToBookmark = function(e){
	bookmark.style.display = "none";
};

Tabs.addToBookmark = function(e){
	console.log(e);
	
	Tabs.bookmarklist();
	
	var links_checked = document.querySelectorAll('.link:checked');
	
	for (var i = 0; i < links_checked.length; i++){
		var anchor = links_checked[i].nextSibling;
		chrome.bookmarks.create({
			title: anchor.innerText,
			url: anchor.href
		});
		links_checked[i].checked = false;
	}
	
	return false;
};

Tabs.copyToClipboard = function(e){
	
	var links_text = '';
	var links_checked = document.querySelectorAll('.link:checked');
	
	for (var i = 0; i < links_checked.length; i++){
		links_text += links_checked[i].nextSibling.href + "\n";
	}
	
	var textarea = document.createElement('textarea');
	
	document.body.appendChild(textarea);

	textarea.value = links_text;
	textarea.focus();
	textarea.select();

	//document.execCommand('SelectAll');
	//document.execCommand("Copy", false, null);
	document.execCommand( 'Copy' );
	
	document.body.removeChild(textarea);
	
	Tabs.notification('info', "URLs copied to the clipboard");
	
	return false;
};

Tabs.isUrl = function(s) {
	return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(s);
};

Tabs.bookmarklist = function(){

	chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
		console.log(bookmarkTreeNodes);
	});

};

Tabs.checkall = function(){
	var links_checked = document.querySelectorAll('.link:not(:checked)');
	var checked = 0;
	for(var i = 0; i < links_checked.length; i++){
		links_checked[i].checked = true;
		checked++;
	}
	if(checked == 0) Tabs.uncheckall();
	else check.innerText = "None";
	return false;
};

Tabs.uncheckall = function(){
	var links_checked = document.querySelectorAll('.link:checked');
	var checked = 0;
	for( var i = 0; i < links_checked.length; i++){
		links_checked[i].checked = false;
		checked++;
	}
	if(checked != 0) check.innerText = "All";
	
	return false;
};

Tabs.notification = function(type, message){

	notification.className = type;
	notification.innerHTML = message;
	notification.style.display = "block";
	
	setTimeout(function() { notification.style.display = "none" }, 3000);
}

/* function addElementAfter(node,tag,id,htm){
	var ne = document.createElement(tag);
	if(id) ne.id = id;
	if(htm) ne.innerHTML = htm;
	node.parentNode.insertBefore(ne,node.nextSibling);
}
 */
document.addEventListener('DOMContentLoaded', function () {
	$('check').bind('click', Tabs.checkall);
	$('add').bind('click', Tabs.configAddToBookmark);
	$('copy').bind('click', Tabs.copyToClipboard);
	$('cancel').bind('click', Tabs.cancelAddToBookmark);
});