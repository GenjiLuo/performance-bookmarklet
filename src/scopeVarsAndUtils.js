
//scope wide vars
var localResources = [],
	externalResources = [],
	allRessourcesCalc = [],
	fileTypes = [],
	fileTypesBySource = [],
	resources,
	marks,
	perfTiming,
	outputHolder;

//feature check gate
if(window.performance && window.performance.getEntriesByType !== undefined) {
	resources = window.performance.getEntriesByType("resource");
	marks = window.performance.getEntriesByType("mark");
}else if(window.performance && window.performance.webkitGetEntriesByType !== undefined) {
	resources = window.performance.webkitGetEntriesByType("resource");
	marks = window.performance.webkitGetEntriesByType("mark");
}else{
	alert("Oups, looks like this browser does not support the Ressource Timing API\ncheck http://caniuse.com/#feat=resource-timing to see the ones supporting it \n\n");
	return;
}

if(window.performance.timing){
	perfTiming = window.performance.timing;
}else{
	alert("Oups, looks like this browser does not support performance timing");		
}

//remove this bookmarklet from the result
resources = resources.filter(function(currR){
	return !currR.name.match(/http[s]?\:\/\/nurun.github.io\/resourceTable\/.*/);
});


//helper functions

//creat html tag
var newTag = function(tagName, settings, css){
	settings = settings || {};
	var tag = document.createElement(tagName);
	for(var attr in settings){
		if(attr != "text"){
			tag[attr] = settings[attr];
		}
	}
	tag.textContent = settings.text;
	tag.style.cssText = css || "";
	return tag;
};

//create svg element
var newElementNs = function(tagName, settings, css){
	var el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
	for(var attr in settings){
		if(attr != "text"){
			el.setAttributeNS(null, attr, settings[attr]);
		}
	}
	el.textContent = settings.text;
	el.style.cssText = css || "";
	return el;
};

var newTextElementNs = function(text, y){
	return newElementNs("text", {
			fill : "#000",
			y : y,
			text : text
		}, "pointer-events:none; text-shadow:0 0 2px #fff;");
};

var getNodeTextWidth = function(textNode){
	var tmp = newElementNs("svg:svg", {}, "visibility:hidden;");
	tmp.appendChild(textNode);
	document.body.appendChild(tmp);
	var nodeWidth = textNode.getBBox().width;
	tmp.parentNode.removeChild(tmp);
	return nodeWidth;
};

var getRandomColor = function() {
	var letters = '0123456789ABCDEF'.split(''),
		color = '#';
	for (var i = 0; i < 6; i++ ) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
};

var getItemCount = function(arr, keyName) {
	var counts = {},
		resultArr = [];

	arr.forEach(function(key){
		counts[key] = counts[key] ? counts[key]+1 : 1;
	});

	//pivot data
	for(var fe in counts){
		obj = {};
		obj[keyName||"key"] = fe;
		obj.count = counts[fe];

		resultArr.push(obj);
	}
	return resultArr.sort(function(a, b) {
		return a.count < b.count ? 1 : -1;
	});
};

// find or create holder element
outputHolder = document.getElementById("resourceTable-holder");
if(!outputHolder){
	outputHolder = newTag("div", {id : "resourceTable-holder"}, "position:absolute; top:0; left:0; z-index: 9999; padding:1em 1em 3em; background:rgba(255,255,255, 0.95);");
}else{
	//clear existing data
	while (outputHolder.firstChild) {
		outputHolder.removeChild(outputHolder.firstChild);
	}
}