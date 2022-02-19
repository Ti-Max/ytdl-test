var http = require('http');
var ytdl = require('ytdl-core');
var url = require('url');
var fs = require('fs');
var ffmpeg = require('ffmpeg-static');
const cp = require('child_process');

http.createServer(async function (req, res) {
	const q = url.parse(req.url, true);
	// console.log(q, req.url);
	if (req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(fs.readFileSync('index.html'))
	}
	else if(q.pathname === '/getInfo/https://www.youtube.com/watch'|| q.pathname === '/getInfo/www.youtube.com/watch'){
		const id = q.query.v;
		if(id !== undefined){
			const videoInfo = await ytdl.getInfo(id);

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
		if(/*q.query.quality === '360p' || q.query.quality === '720p'*/ false){
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
			res.writeHead(200, {
				'Content-Type': 'video/mp4',
				'Content-Disposition': 'attachment; filename="video.mp4"',
				// 'Content-Length': videoInfo.formats[formatId].contentLength
			});			
			const videoInfo = await ytdl.getInfo(q.query.v);

			try{
				const format = ytdl.chooseFormat(videoInfo.formats, {filter: (format) => {
					return format.qualityLabel === q.query.quality && format.container === 'mp4';
				}});

			}
			catch (err){
				console.error(err);
			}
			const video = ytdl.downloadFromInfo(videoInfo, {format : format});
			// const video = ytdl(q.query.v, {filter: 'videoonly', quality: 'lowest'});
			const audio = ytdl(q.query.v, { filter: 'audioonly', highWaterMark: 1<<25});
			// Start the ffmpeg child process
							const ffmpegProcess = cp.spawn(ffmpeg, [
								// Remove ffmpeg's console spamming
								// '-loglevel', '0', '-hide_banner',
								// '-progress', 'pipe:3',
								'-i', 'pipe:4',
								'-i', 'pipe:5',
								'-reconnect', '1', 
								// '-reconnect_streamed', '1',
								// '-reconnect_delay_max', '4',
								// Rescale the video
								// '-vf', 'scale=1980:1080',
								// Choose some fancy codes
								'-c:v', 'copy',
								'-c:a', 'mp3',
								// '-map', '0:a',
								// '-map', '1:v',
								// Define output container
								'out.mp4'
							], {
								windowsHide: true,
								stdio: [
								/* Standard: stdin, stdout, stderr */
								'inherit', 'inherit', 'inherit',
								/* Custom: pipe:4, pipe:5, pipe:6 */
								 'pipe', 'pipe', 'pipe',
								],
							});
							// cp.spawn();
							video.pipe(ffmpegProcess.stdio[4]);
							audio.pipe(ffmpegProcess.stdio[5]);
							// ffmpegProcess.stdio[5].pipe(res); 
							console.log('DONE');
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