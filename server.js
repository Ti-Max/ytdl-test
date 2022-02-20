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

			const formats = videoInfo.formats;
			let resVideoInfo = {id : id, Options : []};

			const formatsFounded = [];
			for (let i = 0; i < formats.length; i++){
				if (formats[i].hasAudio === false &&  formats[i].container === 'mp4' && !formatsFounded.includes(formats[i].qualityLabel)){
					resVideoInfo.Options.push({
						'QualityLabel' : formats[i].qualityLabel,
						'size' : formats[i].contentLength // Should return not only video's size but also audio
					});

					formatsFounded.push(formats[i].qualityLabel);
				}	
			}

			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify( resVideoInfo));
		}
	}
	else if (q.pathname === '/download' && q.query.v !== undefined && q.query.quality !== undefined) {
		
		const videoInfo = await ytdl.getInfo(q.query.v);

		const videoFormat = ytdl.chooseFormat(videoInfo.formats, {filter: (format) => {
			return format.qualityLabel === q.query.quality && format.container === 'mp4' && !format.hasAudio;
		}});			

		const video = ytdl.downloadFromInfo(videoInfo, {format : videoFormat});
		const audio = ytdl.downloadFromInfo(videoInfo, {filter : (format) => {
			return !format.hasVideo && format.audioQuality === (videoFormat.quality === 'tiny' || 'small' || 'medium' || 'large')? 'AUDIO_QUALITY_LOW':'AUDIO_QUALITY_MEDIUM';
		}});
		// Start the ffmpeg child process
		const ffmpegProcess = cp.spawn(ffmpeg, [
			// '-loglevel', '0', '-hide_banner',
			'-i', 'pipe:3',
			'-i', 'pipe:4',

			'-c:v', 'copy',
			'-c:a', 'copy',

			// Define output container
			'-f', 'matroska', 'pipe:5',
		], {
			windowsHide: true,
			stdio: [
			/* Standard: stdin, stdout, stderr */
			'inherit', 'inherit', 'inherit',
			/* Custom: pipe:4, pipe:5, pipe:6 */
			 'pipe', 'pipe', 'pipe',
			],
		});
			res.writeHead(200, {
			'Content-Type': 'video/mp4',
			'Content-Disposition': 'attachment; filename="'+videoInfo.videoDetails.title+'.mp4"',
			// 'Content-Length': videoFormat.contentLength //does not work
		});		

		video.pipe(ffmpegProcess.stdio[3]);
		audio.pipe(ffmpegProcess.stdio[4]);
		ffmpegProcess.stdio[5].pipe(res); 
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