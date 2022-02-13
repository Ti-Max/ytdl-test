var http = require('http');
var ytdl = require('ytdl-core');
var url = require('url');
var fs = require('fs');
var yturl = require('youtube-url');
const { info } = require('console');


const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

http.createServer(async function (req, res) {
	const q = url.parse(req.url, true);
	if (req.url == '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(fs.readFileSync('index.html'))
	}
	else if (q.pathname === '/https://www.youtube.com/watch' || q.pathname === '/www.youtube.com/watch') {
		res.writeHead(200, { 'Content-Type': 'application/json' });

		const id = q.query.v;
		const dlpath = 'ytdl/' + id + '.mp4';
		
		const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=1tbRuLxYzco');

		const formats = ytdl.filterFormats(videoInfo.formats, 'audioandvideo');
		let jsonRes;
		for (let i = 0; i < formats.length; i++){
			jsonRes += '{"Quality" : ' + formats[i].qualityLabel + ', "URL" : '+formats[i].url + '}'
		}

		res.end(jsonRes);
		// ytdl.getInfo('https://www.youtube.com/watch?v=1tbRuLxYzco').then(info => {
		// 	console.log(info.videoDetails.title);
		// });
		// videoInfo.then(info => {
		// })

		// var x = ytdl('http://www.youtube.com/watch?v='+ id)
		// await x.pipe(fs.createWriteStream(dlpath));

		// /*
		// 	Dette er ikke optimalt, en bedre måte å gjøre det på
		// 	er å vente til fs.createWriteStream(dlpath)); er ferdig. */
		// 	await sleep(10000);
		// /*
		// 	Jeg klarte ikke å få det til :) */

		// var stat = fs.statSync(dlpath);
		// res.writeHead(200, {
		// 	'Content-Type': 'video/mp4',
		// 	'Content-Disposition': 'attachment; filename="video.mp4"',
		// 	'Content-Length': stat.size
		// });

		// var readStream = fs.createReadStream(dlpath);
		// await readStream.pipe(res);

		// Obs. Filen blir ikke slettet, vanlig at dette
		// gjøres etterhvert av et annet skript.
	}

	/*
		Hvis lenke ikke er /ytdl/<id> eller / (hjemmeside), last inn /<side>.html
	*/
	else {
		// Tatt fra https://www.w3schools.com/nodejs/nodejs_url.asp
	  var filename = "." + q.pathname;
	  fs.readFile(filename, function(err, data) {
	    if (err) {
	      res.writeHead(404, {'Content-Type': 'text/html'});
	      return res.end("404 Not Found");
	    }
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.write(data);
	    return res.end();
	  });
	}

}).listen(8080);


// var http = require('http');
// var url = require('url');
// var fs = require('fs');

// http.createServer(function (req, res) {
// 	res.writeHead(200, {'Content-Type': 'text/html'});
// 	let q = url.parse(req.url, true);

// 	if(req.url === '/'){
// 		let homePage = fs.readFileSync('./index.html');
		
// 		res.end(homePage);
// 	}
// 	// else if(){

// 	// }
// 	else{
// 		var filename = "." + q.pathname;
// 		fs.readFile(filename, function(err, data) {
// 		if (err) {
// 		  	res.writeHead(404, {'Content-Type': 'text/html'});
// 		  	return res.end("404 Not Found");
// 		}
// 		res.writeHead(200, {'Content-Type': 'text/html'});
// 		res.write(data);
// 		return res.end();
// 	});
// 	}
	
// }).listen(8080);