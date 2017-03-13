// SAVE MY TABS
chrome.tabs.query({
	currentWindow: true,
	pinned: false
}, function(tabs) {

	tabs = tabs.filter(function(tab){
		return tab.url.indexOf('chrome://') === -1;
	});

	console.log(tabs);
	
	urlList.innerHTML = tabs.map(function(tab){
		return '<li><input type="checkbox" class="link" checked="checked" />' +
				'	<img src="' + tab.favIconUrl + '" class="favicon" />' +
				'	<a href="'+ tab.url + '" title="'+ htmlEscape(tab.title) + '" target="_blank">' + htmlEscape(tab.title) + '</a>' +
				'</li>';
	}).join('');
	
	counter.innerHTML = '<span>' + tabs.length + '</span> URL' + (tabs.length != 1 ? 's' : '');
});

document.addEventListener('DOMContentLoaded', function () {
	$('check').bind('click', Tabs.checkall);
	$('add').bind('click', Tabs.configAddToBookmark);
	$('copy').bind('click', Tabs.copyToClipboard);
	
	$('create').bind('click', Tabs.configNewFolder);
	$('save').bind('click', Tabs.saveBookmark);
	$('cancel').bind('click', Tabs.cancelAddToBookmark);
});

NodeList.prototype.forEach = Array.prototype.forEach;

NodeList.prototype.map = Array.prototype.map;

String.prototype.trim = function(){
	return this.replace(/^\s+|\s+$/g, ''); 
};

function htmlEscape(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function isUrl(s) {
	return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(s);
}