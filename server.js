var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var url     = 'https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=chuck+taylor+2+buy';
var app     = express();

request(url, function(error, response, body) {
	if (error) {
		console.log("Couldn't get page because of error: " + error);
		return;
	}

	// load the body of the page into Cheerio so we can traverse the DOM
	var $     = cheerio.load(body);
	var links = $(".r a");

	links.each(function(i, link) {
		// get the href attribute of each link
		var url = $(link).attr("href");

		// strip out unnecessary junk
		url = url.replace("/url?q=", "").split("&")[0];

		if (url.charAt(0) === "/") {
			return;
		}

		// this link counts as a result, so increment results
		totalResults++;
	})
})

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app; 