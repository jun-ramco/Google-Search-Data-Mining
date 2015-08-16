var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var url     = 'https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=chuck+taylor+2+buy';
var app     = express();

app.get('/scrape', function(req, res){	
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

			console.log('hey');

			// this link counts as a result, so increment results
			totalResults++;

			// download that page
			request(url, function(error, response, body){
				if (error) {
					console.log("Couldn't get page because of error: " + error);
					return;
				}
				// load the page into Cheerio
				var $page = cheerio.load(body);
				var text  = $page("body").text();
			})
		})
	});
});

app.listen('8080')
console.log('Magic happens on port 8080');
exports = module.exports = app; 