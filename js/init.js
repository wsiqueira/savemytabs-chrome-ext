// SAVE MY TABS
chrome.tabs.query({
	currentWindow: true,
	pinned: false
}, function(tabs) {
	
	var tabs_html = '',
		count = 0;

	tabs.forEach(function(tab){
		
		tabs_html +='<li><input type="checkbox" class="link" checked="checked" />' +
					'	<img src="' + tab.favIconUrl + '" class="favicon" />' +
					'	<a href="'+ tab.url + '" title="'+ htmlEscape(tab.title) + '" target="_blank">' + htmlEscape(tab.title) + '</a>' +
					'</li>';

		count++;
	});
	
	counter.innerHTML = '<span>' + count + '</span> URL' + (count != 1 ?'s':'');
	urlList.innerHTML = tabs_html;
});

var $ = function(e){
	
	var el = e;
	
	if(typeof e === "string"){
		el = window[e];
	}
	
	if(el.length === 0){
		el = document.querySelectorAll(e);
	}
	//console.log(el);

	el.bind = function(event, func){
		this.addEventListener(event, func);
	};
	
	el.unbind = function(event, func){
		this.removeEventListener(event, func);
	};
	
	el.hide = function(){
		this.style.display = "none";
	};
	
	el.show = function(){
		this.style.display = "block";
	};
	
	el.toggle = function(){
		return this.style.display == "none" ? this.show() : this.hide();
	};
	
	return el;
};

var Tabs = function(){};

Tabs.configAddToBookmark = function(e){
	Tabs.notification('info', "Select a destination folder");
	Tabs.bookmarklist();
	$(bookmark).show();
};

Tabs.cancelAddToBookmark = function(e){
	$(notification).hide();
	$(bookmark).hide();
};

Tabs.configNewFolder = function(e){
	$(newfolder).show();
	
	bookmarkList.onchange = updateNotification;
	
	newfolder.onkeyup = updateNotification;
	
	function updateNotification(e){
		if(newfolder.value.length > 0){
			Tabs.notification('info', "Folder: '" + newfolder.value + "' will be created inside: '" + bookmarkList.options[bookmarkList.selectedIndex].innerText.trim() + "'", false);
		}else{
			$(notification).hide();
		}
	}
	//this.unbind('click', Tabs.configNewFolder);
};

Tabs.saveBookmark = function(e){
	
	if(newfolder.value.length > 0){
		chrome.bookmarks.create({
			parentId: bookmarkList.options[bookmarkList.selectedIndex].value,
			title: newfolder.value,
		}, Tabs.addToBookmark);
		
		newfolder.value = "";
		$(newfolder).hide();
	
	}else{
		Tabs.addToBookmark();
	}
	
	return false;
};

Tabs.addToBookmark = function(bookmarkTreeNode){
	var parentId;
	if(bookmarkTreeNode){
		parentId = bookmarkTreeNode.id;
		Tabs.appendNewOption(bookmarkTreeNode.title, parentId, bookmarkTreeNode.parentId);
	}else{
		parentId = bookmarkList.options[bookmarkList.selectedIndex].value;
	}
	
	var links_checked = document.querySelectorAll('.link:checked');
	
	if(links_checked.length > 0){ //checks for selected links
		for (var i = 0; i < links_checked.length; i++){
			var anchor = links_checked[i].nextSibling;
			chrome.bookmarks.create({
				parentId: parentId,
				title: anchor.innerText,
				url: anchor.href
			});
			links_checked[i].checked = false;
		}
		localStorage.bookmark = parentId;
		
		Tabs.notification('success', "URLs saved to favorite");
	}else{
		Tabs.notification('alert', "Select a URL from list");
	}
};

Tabs.appendNewOption = function(title, value, parentId){
	
	var parentOption = bookmarkList.querySelector("[value='" + parentId + "']");
	var parentDeep = ((parentOption.innerHTML.split("&nbsp;").length - 1) / 4) + 2;
	
	var option = document.createElement('option');
	option.innerHTML = Tabs.buildDeepStyle(parentDeep) + title;
	option.value = value;
	option.selected = true;
	
	var elem = bookmarkList.add(option, parentOption.nextSibling);
};

Tabs.copyToClipboard = function(e){
	
	var links_text = '';
	var links_checked = document.querySelectorAll('.link:checked');
	
	if(links_checked.length === 0){
		Tabs.notification('alert', "Select a URL from list");
		return false;
	}

	links_checked.forEach(function(link){
		links_text += link.parentNode.lastChild.href + "\n";
	});
	
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

Tabs.bookmarklist = function(){
	
	chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
		Tabs.dumpTreeNodes(bookmarkTreeNodes);
	});
	
};

Tabs.checkall = function(){
	var links_checked = document.querySelectorAll('.link:not(:checked)');
	var checked = 0;
	for(var i = 0; i < links_checked.length; i++){
		links_checked[i].checked = true;
		checked++;
	}
	if(checked === 0) Tabs.uncheckall();
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
	if(checked !== 0) check.innerText = 'All';
	
	return false;
};


Tabs.isUrl = function(s) {
	return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(s);
};

Tabs.notification = function(type, message, hide){
	notification.className = type;
	notification.innerHTML = message;
	notification.style.display = "block";
	
	if( hide === undefined || hide === true ) {
		setTimeout(function() { $(notification).hide(); }, 3000);
	}
};

Tabs.dumpTreeNodes = function(bookmarkNodes, deep) {
	var list = "";
	deep = deep || 0;
	for (var i = 0; i < bookmarkNodes.length; i++) {
		list += Tabs.dumpNode(bookmarkNodes[i], deep);
	}
	bookmarkList.innerHTML = list;
	return list;
};

Tabs.dumpNode = function(bookmarkNode, deep) {
	if (bookmarkNode.children){ // bookmarkNode.children.length > 0 can I get empty folder?
		
		var option = "";
		if (bookmarkNode.title) {
			option = "<option value='"+ bookmarkNode.id + "'" + (localStorage.bookmark && (localStorage.bookmark == bookmarkNode.id) ? 'selected="selected"':'') + ">"+ Tabs.buildDeepStyle(deep) + bookmarkNode.title + "</option>";
		}
		option += Tabs.dumpTreeNodes(bookmarkNode.children, deep + 1);
		return option;
	}
	return "";
};

Tabs.buildDeepStyle = function(deep){
	var str = "&nbsp;", result = "";
	deep = Math.max(deep - 1, 0) * 4;
	while( deep--)result += str;
	return result;
};
 
/* function addElementAfter(node,tag,id,htm){
	var ne = document.createElement(tag);
	if(id) ne.id = id;
	if(htm) ne.innerHTML = htm;
	node.parentNode.insertBefore(ne,node.nextSibling);
}*/

document.addEventListener('DOMContentLoaded', function () {
	$('check').bind('click', Tabs.checkall);
	$('add').bind('click', Tabs.configAddToBookmark);
	$('copy').bind('click', Tabs.copyToClipboard);
	
	$('create').bind('click', Tabs.configNewFolder);
	$('save').bind('click', Tabs.saveBookmark);
	$('cancel').bind('click', Tabs.cancelAddToBookmark);
});

String.prototype.trim = function(){
	return this.replace(/^\s+|\s+$/g, ''); 
};

/*var tagsToReplace = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'\'': '&#39'
};

function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str) {
    return str.replace(/[&<>]/g, replaceTag);
}
*/
function htmlEscape(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/*function htmlUnescape(str){
	return str
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}*/