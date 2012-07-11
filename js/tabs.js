/* var properties = {
	"title" : "Abrir tudo em abas",
	"contexts" : ["selection"],
	"onclick": genericOnClick
} */

function getUrls(s) {
	return s.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi);
}

chrome.contextMenus.removeAll();

chrome.contextMenus.create({"title" : "Abrir tudo em abas",	"contexts" : ["selection"],	"onclick": function(info, tab) {
	console.log(info);
	
	var selected_text = info.selectionText;
	
	if(selected_text && selected_text != null){
	
		var text_links = getUrls(selected_text)
		console.log(text_links);
		
		for(var i = 0; i< text_links.length; i++){
			//console.log(text_links[i]);
			chrome.tabs.create({url: text_links[i],active: false});
		}
		
	}
}});