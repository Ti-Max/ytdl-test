var http = require('http');
var ytdl = require('ytdl-core');
var url = require('url');
var fs = require('fs');
var pathToFfmpeg = require('ffmpeg-static');

http.createServer(async function (req, res) {
	console.log(pathToFfmpeg);
	const q = url.parse(req.url, true);
	// console.log(q, req.url);
	if (req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(fs.readFileSync('index.html'))
	}
	else if(q.pathname === '/getInfo/https://www.youtube.com/watch'|| q.pathname === '/getInfo/www.youtube.com/watch'){
		const id = q.query.v;
		if(id !== undefined){
			const videoInfo = await ytdl.getBasicInfo(id);

			const formats = videoInfo.player_response.streamingData.formats;
			let resVideoInfo = {id : id, Options : []};
			for (let i = 0; i < formats.length; i++){
				resVideoInfo.Options.push({
					'QualityLabel' : formats[i].qualityLabel,
					'size' : formats[i].contentLength
				});
			}
			// console.log();
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(resVideoInfo));
		}
	}
	else if (q.pathname === '/download' && q.query.v !== undefined && q.query.quality !== undefined) {
		
		//If format with audio and video choosen
		if(q.query.quality === '360p' || q.query.quality === '720p'){
			const videoInfo = await ytdl.getInfo(q.query.v);
			// const format = ytdl.chooseFormat(videoInfo.formats, {filter: (format) => {
			// 	return format.qualityLabel === q.query.quality && format.itag === 22;
			// }});
			// console.log(format);
			let formatId = 0;
			for (let i = 0; i < videoInfo.formats.length; i++) {
				if (videoInfo.formats[i].qualityLabel === q.query.quality && videoInfo.formats[i].hasAudio){
					formatId = i;
					break;	
				}
			}
			console.log(videoInfo.formats);
			const stream = ytdl.downloadFromInfo(videoInfo, {format : videoInfo.formats[formatId]});
			res.writeHead(200, {
				'Content-Type': 'video/mp4',
				'Content-Disposition': 'attachment; filename="video.mp4"',
				// 'Content-Length': videoInfo.formats[formatId].contentLength
			});
			stream.pipe(res);
		}
		else{

		}
	}

	else {

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
console.log('Server running at http://localhost:8080');