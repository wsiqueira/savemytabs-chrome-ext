String.prototype.format = function () {
	var pattern = /\{\d+\}/g;
	var args = arguments;
	return this.replace(pattern, function (capture) { return args[capture.match(/\d+/)]; });
};

$(function() {
	setup();
});


// SAVE MY TABS
chrome.tabs.getAllInWindow(null, function(tabs) {
	tabs.forEach(function(tab){
		saveMyTabs(tab.url);	
	});
	setup();
});

function saveMyTabs(tablink) {
	console.log(tablink);
	var newNode = document.createElement("li");
	
	urlList.appendChild(newNode);
	newNode.innerHTML='<label><input type="checkbox" class="custom" /><span>' + tablink + '</span></label>';
}



/* 
	Theme Name: Function - FORM ELEMENTS
	Description: JS desenvolvido para EWTI pela Amendolas Web
	Author: Murilo Amendola
	Empresa: Amendolas Web
	Author URI: http://www.amendolas.com.br
	Version: 0.0.0.5
*/
function setup(){
var parentHtml = '<span class="mask{0}"/>';
	$('input.custom[type=radio], input.custom[type=checkbox], input.custom[type=file], select.custom').each(function(index) {
		var obj = $(this).clone();
		var type = obj.is('select') ? 'select' : obj.attr('type');
		var title = obj.attr('title') === undefined ? '' : obj.attr('title');
		
		var parentObj = $(parentHtml.format(type));
		parentObj.append(obj);
		
		if(obj.is('select, input.custom[type=file]')) {
			var boxText = $('<span class="text"/>').text(  parentObj.find(':selected').text() );
			parentObj.append(boxText).append('<span class="btn">' + title + '</span>');
		}
		
		if(!obj.is('select') && obj.is(':checked')) parentObj.addClass('active');
		
		$(this).replaceWith(parentObj);
	});
	
	$('input.custom[type=radio], input.custom[type=checkbox]').change( function (){
		var obj = $(this);
		
		$('input.custom[name='+ obj.attr('name') + ']').parent().removeClass('active');
		
		obj.parent().toggleClass('active');
	});
	
	$('select.custom, input.custom[type=file]').change(function() {
		var select = $(this);
		var selectedText = select.parent().find('span.text');
		
		var value = select.is('select') ? select.find(':selected').text() : select.val();

		selectedText.html(value);
	});
}


	
	

