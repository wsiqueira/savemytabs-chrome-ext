//const isURL = /(((https?:\/\/)|(www\.))[a-zA-Z0-9]{1,256}\.[a-zA-Z0-9]{1,4}\.?[a-zA-Z0-9]?\S+)|((www\.)?[a-zA-Z0-9]{1,256}\.[a-zA-Z0-9]{1,4}\.?[a-zA-Z0-9]?\S+)/gi;

var isURL = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;

chrome.contextMenus.removeAll();

chrome.contextMenus.create({
	title : 'Open links in new tabs', 
	contexts : ['selection'], 
	onclick: function(info) {

		if( info.selectionText ) {
		
			var links = info.selectionText.match(isURL);

			if( ! links ) return;
			
			chrome.tabs.getSelected(null, function(tab) {
				links.forEach( createTab.bind(tab) );
			});
		}
	}
});

function createTab(link, index) {
	chrome.tabs.create({
		url: link,
		active: false,
		index: this.index + 1 + index,
		openerTabId: this.id
	});
}