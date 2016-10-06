cleanAndParseJSON = function(strData) {
	try {
		//return $.parseJSON(strData.replace(/\n/g,"").replace(/^\s*<(\w+).*>.*<\/\1>/, "").replace(/<(\w+).*>.*<\/\1>\s*$/, ""));
		return $.parseJSON(strData.replace(/\n|^\s+|\s+$/g,"").replace(/^<(\w+).*>.*<\/\1>\s*|\s*<(\w+).*>.*<\/\1>$/, "").replace(/<html>(.*?)<\/html>/i, "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""));
	} catch (e) {
		try {
			return $.parseJSON(strData);
		} catch (e) {}
	}
	return strData;
}
