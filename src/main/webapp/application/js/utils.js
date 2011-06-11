var fincayra = {};
fincayra.setContentType = function(type) {
	if (type == undefined) {
		type = 'application/x-www-form-urlencoded';
	}
	$.ajaxSetup({contentType:type});
}

fincayra.truncate = function(text, len, suffix) {
	if (text != null && text != undefined && text.length > len) {
		text = text.substring(0, len-suffix.length);
		text = text.replace(/^(.*) \w*$/, "$1") + suffix;
	}
	
	return text;
};

fincayra.byObjectsAttribute = function(name) {
      return function(obj1,obj2){
            var n1;
            var n2;
            if(typeof obj1 === 'object' && typeof obj2 === 'object' && obj1 && obj2){
                n1 = obj1[name];
                n2 = obj2[name];
                if(n1 === n2){
                    return obj1;
                }
                if(typeof n1 === typeof n2){
                    return n1 < n2 ? -1 : 1;
                }
            }else{
                throw{
                    name: 'Error',
                    message: 'Expected object when sorting by ' + name
				};
            }
       };
};

fincayra.sortBy = function(a, attr) {
	return a.sort(fincayra.byObjectsAttribute(attr));
};

fincayra.prettyDate = function(time){
	time = new Number(time);
	var date = new Date(time),
		diff = (((new Date()).getTime() - date.getTime()) / 1000),
		day_diff = Math.floor(diff / 86400);
			
	if ( isNaN(day_diff) || day_diff < 0)
		return;
			
	return day_diff == 0 && (
			diff < 60 && "just now" ||
			diff < 120 && "1 minute ago" ||
			diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
			diff < 7200 && "1 hour ago" ||
			diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
		day_diff == 1 && "Yesterday" ||
		day_diff < 7 && day_diff + " days ago" ||
		day_diff && Math.ceil( day_diff / 7 ) + " weeks ago";
};

String.prototype.tokenize = function() {
	var args = arguments;
	var result = this;
	
	if (args.length > 0) {
		for(var i=0; i<args.length; i++) {
			result = result.replace(/\{\}/, args[i]);
		} 	
	}
	
	return result;
};


