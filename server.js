var express           = require('express');
var request           = require('request');
var cheerio           = require('cheerio');
var app               = express();
var url               = 'https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=chuck+taylor+2+buy';
var corpus            = {};
var totalResults      = 0;
var resultsDownloaded = 0;

function callback() {
	resultsDownloaded++;

	if (resultsDownloaded !== totalResults) {
		return;
	}

	var words = [];

	// stick all words in an array
	for (prop in corpus) {
		words.push({
			word: prop,
			count: corpus[prop]
		});
	}

	// sort array based on how often they occur
	words.sort(function(a, b){
		return b.count - a.count;
	});

	// finally, log the first fifty most popular words
	console.log(words.slice(0, 20));
}

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

				// throw away extra whitespace and non-alphanumeric characters
				text = text.replace(/\s+/g, " ")
				           .replace(/[^a-zA-Z ]/g, "")
				           .toLowerCase();

				// split on spaces for a list of all the words on that page and
				// loop through that list
				text.split(" ").forEach(function (word) {
					// we don't want to include very short or long words, as they're
					// probably bad data
					if (word.length < 4 || word.length > 20) {
						return;
					}

					if (corpus[word]) {
						// if this word is already in our "corpus", our collection
						// of terms, increase the count by one
						corpus[word]++;
					} else {
						// otherwise, say that we've found one of that word so far
						corpus[word] = 1;
					}
				});

				// and when our request is completed, call the callback to wrap up!
				callback();
			});
		});
	});
});

app.listen('8080')
console.log('Magic happens on port 8080');
exports = module.exports = app; 