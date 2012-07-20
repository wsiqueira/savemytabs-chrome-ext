// SAVE MY TABS
chrome.tabs.getAllInWindow(null, function(tabs) {
	
	var tabs_html = '';
	tabs.forEach(function(tab){
		if(!isUrl(tab.url)) return;
		tabs_html +='<li><label><input type="checkbox" class="link" checked="checked"/><a href="'+ tab.url + '">' + tab.title + '</a></label></li>';
	});
	
	urlList.innerHTML = tabs_html;
});

document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('check').addEventListener('click', checkall);
	
	document.getElementById('add').addEventListener('click', addToBookmark);
	document.getElementById('copy').addEventListener('click', copyToClipboard);
});

(function(d){
	addToBookmark = function(e){
		console.log(e);
		
		bookmarklist();
		
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
	},
	
	copyToClipboard = function(e){
		console.log(e);
		
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
		
		return false;
	},
	isUrl = function(s) {
		return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(s);
	},
	bookmarklist = function(){
	
		chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
			console.log(bookmarkTreeNodes);
		});
	
	},
	checkall = function(){
		var links_checked = document.querySelectorAll('.link:not(:checked)');
		var checked = 0;
		for(var i = 0; i < links_checked.length; i++){
			links_checked[i].checked = true;
			checked++;
		}
		if(checked == 0) uncheckall();
		else check.innerText = "None";
		return false;
	},

	uncheckall = function(){
		var links_checked = document.querySelectorAll('.link:checked');
		var checked = 0;
		for( var i = 0; i < links_checked.length; i++){
			links_checked[i].checked = false;
			checked++;
		}
		if(checked != 0) check.innerText = "All";
		
		return false;
	}
	
	
}(document));

String.prototype.format = function () {
	return this.replace(/\{\d+\}/g, function (capture) { return arguments[capture.match(/\d+/)]; });
};