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