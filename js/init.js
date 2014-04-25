// SAVE MY TABS
var $ = function(e){
	
	var el = e;
	
	if(typeof e === "string"){
		el = window[e];
	}
	
	if(el.length == 0){
		el = document.querySelectorAll(e);
	}
	//console.log(el);

	el.bind = function(event, func){
		this.addEventListener(event, func);
	}
	
	el.unbind = function(event, func){
		this.removeEventListener(event, func);
	}
	
	el.hide = function(){
		this.style.display = "none";
	}
	
	el.show = function(){
		this.style.display = "block";
	}
	
	el.toggle = function(){
		this.style.display == "none" ? this.show() : this.hide();
	}
	
	return el;
}

var Tabs = function(){};

Tabs.loadTabs = function() {
	chrome.tabs.getAllInWindow(null, function(tabs) {
		
		var tabs_html = '';
		var count = 0;
		var selected = 0;
		tabs.forEach(function(tab){
			if(tab.pinned || !Tabs.isUrl(tab.url)) return;
			
			check = (tab.highlighted) ? ' checked="checked"' : ''
			id = 'link' + count;
			
			tabs_html += '<li>';
			tabs_html += '<input type="checkbox" class="link" id="' + id + '"' + check + ' data-tabid="' + tab.id + '"/>';
			tabs_html += '<a style="display:none" href="'+ tab.url + '" title="'+ tab.title + '" target="_blank">' + tab.title + '</a>';
			tabs_html += '<label for="' + id + '" style="margin:2px">';
			tabs_html += '<img style="display:inline;margin:2px;vertical-align:middle" width="16" height="16" src="' + tab.favIconUrl + '" />'
			tabs_html += tab.title
			tabs_html += '</label>'
			tabs_html += '</li>';
			
			count++;
			if (check) selected++;
		});
		
		urlList.innerHTML = tabs_html;
		Tabs.countSelected()

		// bind recalc
		for(i=0;i<count;i++) {
			id = 'link' + i;
			$(id).bind('click', Tabs.countSelected)
		}
	});
};

Tabs.loadTabs();

Tabs.countSelected = function() {
	var links_checked = document.querySelectorAll('.link:checked');
	var links = document.querySelectorAll('.link');

	counter.innerHTML = '<span>' + links_checked.length + ' of ' + links.length + '</span> URL' + (links.length != 1 ?'s':'');
}

Tabs.wrapAdd = function(e) {
	movetabs.value = "0";
	save_btn.value = "Save";
	Tabs.configAddToBookmark(e);
}

Tabs.wrapMove = function(e) {
	movetabs.value = "1";
	save_btn.value = "Move";
	Tabs.configAddToBookmark(e);
}

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
	var tabids = new Array();

	// save selected links
	if(links_checked.length > 0){
		for (var i = 0; i < links_checked.length; i++){
			
			tabids.push(parseInt(links_checked[i].dataset.tabid));

			var anchor = links_checked[i].nextSibling;
			chrome.bookmarks.create({
				parentId: parentId,
				title: anchor.innerText,
				url: anchor.href
			});
			links_checked[i].checked = false;
		}
		localStorage.bookmark = parentId;
		
		// close the tabs that were stored as bookmarks
		if(movetabs.value == '1') {
			chrome.tabs.remove(tabids);
			Tabs.loadTabs();
		}

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
}

Tabs.copyToClipboard = function(e){
	
	var links_text = '';
	var links_checked = document.querySelectorAll('.link:checked');
	
	if(links_checked.length == 0){
		Tabs.notification('alert', "Select a URL from list");
		return false;
	}
	
	for (var i = 0; i < links_checked.length; i++){
		links_text += links_checked[i].nextSibling.href + "\n";
	}
	
	var textarea = document.createElement('textarea');
	
	document.body.appendChild(textarea);

	textarea.value = links_text;
	textarea.focus();
	textarea.select();

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
	var links = document.querySelectorAll('.link');
	for(var i = 0; i < links.length; i++){
		links[i].checked = !links[i].checked;
	}
	
	Tabs.countSelected();

	return false;
};

Tabs.isUrl = function(s) {
	return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(s);
};

Tabs.notification = function(type, message, hide){

	notification.className = type;
	notification.innerHTML = message;
	notification.style.display = "block";
	
	if(hide === undefined || hide == true){
		setTimeout(function() { $(notification).toggle(); }, 3000);
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
	if (bookmarkNode.children){ 
		
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
	$('add').bind('click', Tabs.wrapAdd);
	$('move').bind('click', Tabs.wrapMove);
	$('copy').bind('click', Tabs.copyToClipboard);
	
	$('create').bind('click', Tabs.configNewFolder);
	$('save').bind('click', Tabs.saveBookmark);
	$('cancel').bind('click', Tabs.cancelAddToBookmark);
	
});

String.prototype.trim = function(){
	return this.replace(/^\s+|\s+$/g, ''); 
}
