var http = require('http');
var ytdl = require('ytdl-core');
var url = require('url');
var fs = require('fs');
const { format } = require('path');

http.createServer(async function (req, res) {
	const q = url.parse(req.url, true);
	console.log(q, req.url);
	if (req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(fs.readFileSync('index.html'))
	}
	else if(req.url === '/getInfo'){
		const id = q.query.v;
		const videoInfo = await ytdl.getInfo(id);

		const formats = ytdl.filterFormats(videoInfo.formats, 'audioandvideo');
		
		let jsonRes = {Options : []};
		for (let i = 0; i < formats.length; i++){
			jsonRes.Options.push({
				'QualityLabel' : formats[i].qualityLabel,
				'URL' : formats[i].url
			})
		}
		console.log(formats.length);
		const json = JSON.parse(jsonRes); 
		console.log();
		stream.
		res.end(JSON.stringify(jsonRes));
	}
	else if (true) {
		// res.writeHead(200, { 'Content-Type': 'application/json' });
        // res.writeHead(200, "Content-Disposition", `attachment;  filename=video.mp4`);
		// const stream = fs.createReadStream('./video.mp4');
		const videoInfo = await ytdl.getInfo('http://www.youtube.com/watch?v=aqz-KE-bpKQ');
		const formats = ytdl.filterFormats(videoInfo.formats, 'audioandvideo');
		const stream = ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ',{format: formats[0]});

		// const { size } = fs.statSync('./video.mp4');
		res.writeHead(200, {
			'Content-Type': 'video/mp4',
			'Content-Disposition': 'attachment; filename="video.mp4"'
			// 'Content-Length': size
		});
		stream.pipe(res);
		// console.log(size);
		// res.writeHead(206, {
		// 	'Transfer-Encoding': 'chunked',
		// 	'Content-Type': 'video/mp4',
		// 	'Content-Length': size,
		// 	'Content-Disposition': 'attachment; filename=your_file_name'
		// });
		// res.on('data', (chunk) => {
		// 	stream.write(chunk);
		//   });
		  
		//   res.on('end', () => {
		// 	stream.end();
		//   });

		// console.log(res);
		// res.end();
		// const id = q.query.v;
		// const dlpath = 'ytdl/' + id + '.mp4';
		
		// const videoInfo = await ytdl.getInfo(id);

		// const formats = ytdl.filterFormats(videoInfo.formats, 'audioandvideo');
		
		// let jsonRes = {Options : []};
		// for (let i = 0; i < formats.length; i++){
		// 	jsonRes.Options.push({
		// 		'QualityLabel' : formats[i].qualityLabel,
		// 		'URL' : formats[i].url
		// 	})
		// }
		// console.log(formats.length);
		// const json = JSON.parse(jsonRes); 
		// console.log();
		// stream.
		// res.end(JSON.stringify(jsonRes));
		// res.end();
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
console.log('Server running at http://localhost:8080');