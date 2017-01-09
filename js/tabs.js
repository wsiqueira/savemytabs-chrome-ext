const URLS = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
	title : 'Open links in new tabs', 
	contexts : ['selection'], 
	onclick: function(info) {

		const selectedText = info.selectionText;
		
		if( selectedText ) {
		
			const links = selectedText.match(URLS);

			links.forEach( link => window.open(link, '_blank') );
			
			/*chrome.tabs.getSelected(null,function(tab) {
				for(var i = 0; i< text_links.length; i++){
					chrome.tabs.create({
						url: text_links[i],active: false, 
						index: tab.index + 1 + i, 
						openerTabId: tab.id
					});
				}
			})*/
		}
	}
});