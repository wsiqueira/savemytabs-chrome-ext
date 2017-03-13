var Tabs = function(){};

//event add
Tabs.configAddToBookmark = function(e){
	Tabs.notification('info', 'Select a destination folder');
	Tabs.bookmarklist();
	$(bookmark).show();
};

//event cancel
Tabs.cancelAddToBookmark = function(e){
	$(notification).hide();
	$(bookmark).hide();
};

//event create folder
Tabs.configNewFolder = function(e){
	$(newfolder).show();
	
	bookmarkList.onchange = updateNotification;
	
	newfolder.onkeyup = updateNotification;
};

Tabs.updateNotification = function(e){
	if( newfolder.value !== '' ) {
		Tabs.notification('info', "Folder: '" + newfolder.value + "' will be created inside: '" + bookmarkList.options[bookmarkList.selectedIndex].innerText.trim() + "'", false);
	} else {
		$(notification).hide();
	}
};

//event save
Tabs.saveBookmark = function(e){
	
	if( newfolder.value !== '' ) {
		chrome.bookmarks.create({
			parentId: bookmarkList.options[bookmarkList.selectedIndex].value,
			title: newfolder.value,
		}, Tabs.addToBookmark);
		
		newfolder.value = '';
		$(newfolder).hide();
	
	} else {
		Tabs.addToBookmark();
	}
	
	return false;
};

Tabs.addToBookmark = function(bookmarkTreeNode){
	var parentId;

	if( bookmarkTreeNode ) {
		parentId = bookmarkTreeNode.id;
		Tabs.appendNewOption(bookmarkTreeNode.title, parentId, bookmarkTreeNode.parentId);
	} else {
		parentId = bookmarkList.options[bookmarkList.selectedIndex].value;
	}
	
	var links = document.querySelectorAll('.link:checked');
	
	if(links.length > 0){ //checks for selected links

		links.forEach(function(link){
			
			var anchor = link.parentNode.lastChild;

			console.log(anchor);
			
			chrome.bookmarks.create({
				parentId: parentId,
				title: anchor.innerText,
				url: anchor.href
			});

			link.checked = false;
		});

		localStorage.bookmark = parentId;
		
		Tabs.notification('success', 'URLs saved to favorite');
	}else{
		Tabs.notification('alert', 'Select a URL from list');
	}
};

Tabs.appendNewOption = function(title, value, parentId){
	
	var parentOption = bookmarkList.querySelector("[value='" + parentId + "']");
	var parentDeep = ((parentOption.innerHTML.split('&nbsp;').length - 1) / 4) + 2;
	
	var option = document.createElement('option');
	option.innerHTML = Tabs.buildDeepStyle(parentDeep) + title;
	option.value = value;
	option.selected = true;
	
	bookmarkList.add(option, parentOption.nextSibling);
};

//event copy
Tabs.copyToClipboard = function(e){
	
	var links = document.querySelectorAll('.link:checked ~ a');

	console.log('copyToClipboard', links);
	
	if( links.length === 0 ) {
		Tabs.notification('alert', 'Select a URL from list');
		return false;
	}

	var links_text = links.map(function(link){
		return link.href + '\n';
	}).join('');
	
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
	chrome.bookmarks.getTree(Tabs.dumpTreeNodes);
};

//event check
Tabs.checkall = function(){
	var links = document.querySelectorAll('.link:not(:checked)');

	links.forEach(function(link){
		link.checked = true;
	});

	if(links.length === 0) Tabs.uncheckall();
	else check.innerText = 'None';

	return false;
};

Tabs.uncheckall = function(){
	var links = document.querySelectorAll('.link:checked');

	links.forEach(function(link){
		link.checked = false;
	});

	if(links.length !== 0) check.innerText = 'All';

	return false;
};

Tabs.notification = function(type, message, hide){
	notification.className = type;
	notification.innerHTML = message;
	notification.style.display = 'block';
	
	if( hide === undefined || hide === true ) {
		setTimeout(function() { $(notification).hide(); }, 3000);
	}
};

Tabs.dumpTreeNodes = function(bookmarkNodes, deep) {
	var list = '';
	deep = deep || 0;
	for (var i = 0; i < bookmarkNodes.length; i++) {
		list += Tabs.dumpNode(bookmarkNodes[i], deep);
	}
	bookmarkList.innerHTML = list;
	return list;
};

Tabs.dumpNode = function(bookmarkNode, deep) {
	if (bookmarkNode.children){ // bookmarkNode.children.length > 0 can I get empty folder?
		
		var option = '';
		if (bookmarkNode.title) {
			option = '<option value="' + bookmarkNode.id + '"' + (localStorage.bookmark && (localStorage.bookmark == bookmarkNode.id) ? 'selected="selected"':'') + '>' + Tabs.buildDeepStyle(deep) + bookmarkNode.title + '</option>';
		}
		option += Tabs.dumpTreeNodes(bookmarkNode.children, deep + 1);
		return option;
	}
	return '';
};

Tabs.buildDeepStyle = function(deep){
	var str = '&nbsp;', result = '';
	deep = Math.max(deep - 1, 0) * 4;
	while( deep--)result += str;
	return result;
};