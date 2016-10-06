var app = angular.module('app', []);
var route = angular.module('ng');
var urlChanged = false;
app.controller('CTRL', ['$scope', '$location', '$http', '$timeout', '$rootScope', function($scope, $location, $http, $timeout, $rootScope)
{
    $scope.trackUrl = "";
    $scope.songs = 
    [
        {
			//https://www.youtube.com/watch?v=MtN1YnoL46Q
				//This is where the song came from
            name: "Duck Song",
            url: "../assets/media/audio/The Duck Song.mp3"
        },
		{
			//https://www.youtube.com/watch?list=RDbrOWD8WKWsE&v=smEBl_nJtF8
				//This is where the song came from
					//it is a remake of Ray Knox - Dancing For My Life (Ti-Mo Remix Edit)
            name: "Nightcore - Dancing for My Life",
            url: "../assets/media/audio/HD Nightcore - Dancing For My Life.mp3"
        },
        {
			//https://www.youtube.com/watch?v=JozAmXo2bDE
				//This is where the song came from
					//Remake of Learn to Fly by Foo Fighters
            name: "Learn to Fly - Foo Fighters Rocking 1000",
            url: "../assets/media/audio/learnToFly_1000.mp3"
        },
		{
            name: "New Adventure Theme",
            url: "../assets/media/audio/New Adventure Theme.mp3"
        },
        {
            name: "Peanuts Theme",
            url: "../assets/media/audio/Peanuts Theme.mp3"
        }
    ]
    $scope.init = function()
    {
        $timeout(function()
        {
            $scope.retrieveSong();
        }, 200);
        
    }
    $scope.retrieveSong = function()
    {
        var queryObject = $location.search();
        var song = "";
        if(queryObject.song != undefined || queryObject.song != null)
        {
            var songName = queryObject.song.toString().split('_');
            angular.forEach(songName, function(value, index)
            {
                song += value + (index == songName.length - 1 ? "" : " ");
            });
        }
        
        angular.forEach($scope.songs, function(value, index)
        {
            try
            {
                if(value.name.toLowerCase() == song.toLowerCase())
                {
                    $scope.trackUrl = value.url;
                    urlChanged = true;
                }
            }
            catch(error)
            {
                
            }
        });
    }
    
    $scope.capitalize = function(word)
    {
        var returnWord = "";
        angular.forEach(word, function(value, index)
        {
            returnWord += (index == 0 ? value.toUpperCase() : value);
        });
        return returnWord;
    }
    
    $scope.$watch('trackUrl', function(newValue, oldValue)
    {
        var selectedTrack = "";
        angular.forEach($scope.songs, function(value, index)
        {
            try
            {
                if(value.url.toLowerCase() == newValue.toLowerCase())
                {
                    selectedTrack = value.name.toLowerCase().replace(/[ ]/gmi, '_');
                }
            }
            catch(error)
            {
                
            }
        });
        if(selectedTrack != '')
        {
            $location.search('song', selectedTrack);
        }
    });
    
    $scope.$on('$locationChangeStart', function(next, current) 
    {
        $scope.retrieveSong();
    });
    
    $scope.init();
}]);

(function(){
    "use strict";
		
    var NUM_SAMPLES = 256;
    //var SOUND_1 = '../assets/media/audio/New Adventure Theme.mp3';
    var audioElement;
    var analyserNode;
    var canvas,ctx,controls,trackSrc;
    var maxRadius = 200;
    
    var barWidth = 2;
    var barSpacing = 1;
    
    var chainSawEdges = 35;
    var chainSawEdgeIncrement = 1;
    var rotation = 1;
    
    var currentColor;
    var currentHue = 0;
    
    var delayAmount = 0.5;
    var delayNode;
    
    var paused = false;
    var pausedTime = 0;
    var currentTrack;
    var volume = 0.2;
    
    var circleRadius = 20;
    var motionBlur = 0.35;
    
    var currentHue = 0;
    
    var drawCircle = true;
    var drawSpinner = true;
    var drawLines = true;
    var drawBars = true;
	var particles = true;
	var backParticles = true;
    /*var invert = false;
    var tintRed = false;
    var noise = false;
    var lines = false;
    var threshold = false;*/

    
    window.onresize = function()
    {
        resetCanvasScale();
    }
    function init()
    {
        // set up canvas stuff
        canvas = document.querySelector('canvas');
        ctx = canvas.getContext("2d");
        controls = document.querySelector("#controls");
        trackSrc = document.querySelector("#trackUrl");
        currentTrack = trackSrc.value;
			
        // get reference to <audio> element on page
        audioElement = document.querySelector('audio');
			
        // call our helper function and get an analyser node
        analyserNode = createWebAudioContextWithAnalyserNode(audioElement);
			
        // get sound track <select> and Full Screen button working
        setupUI();
			
        // load and play default sound into audio element
        //playStream(audioElement,SOUND_1);
        
        resetCanvasScale();
        
        // start animation loop
        setInterval(adjustHue, 200);
        update();
    }
	
	function resetCanvasScale()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth/2.5;
    }
    function adjustHue()
    {
        currentHue++;
    }
    function createWebAudioContextWithAnalyserNode(audioElement) 
    {
        var audioCtx, analyserNode, sourceNode;
        // create new AudioContext
        // The || is because WebAudio has not been standardized across browsers yet
        // http://webaudio.github.io/web-audio-api/#the-audiocontext-interface
        audioCtx = new (window.AudioContext || window.webkitAudioContext);
        delayNode = audioCtx.createDelay();
        delayNode.delayTime.value = delayAmount;
        // create an analyser node
        analyserNode = audioCtx.createAnalyser();
			
        /*
        We will request NUM_SAMPLES number of samples or "bins" spaced equally 
        across the sound spectrum.
			
			If NUM_SAMPLES (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
			the third is 344Hz. Each bin contains a number between 0-255 representing 
			the amplitude of that frequency.
        */ 
			
        // fft stands for Fast Fourier Transform
        analyserNode.fftSize = NUM_SAMPLES;
        
        // this is where we hook up the <audio> element to the analyserNode
        sourceNode = audioCtx.createMediaElementSource(audioElement); 
        sourceNode.connect(delayNode);
        sourceNode.connect(analyserNode);
        sourceNode.connect(audioCtx.destination);
			
        // here we connect to the destination i.e. speakers
        analyserNode.connect(audioCtx.destination);
        return analyserNode;
    }
		
    function setupUI()
    {
        /*document.querySelector("#trackSelect").onchange = function(e)
        {
            playStream(audioElement,e.target.value);
        };
		*/	
        document.querySelector("#fsButton").onclick = function()
        {
            requestFullscreen(canvas);
        };
        
        document.querySelector("#startSong").onclick = function()
        {
            playStream(audioElement, trackSrc.value);
        }
        document.querySelector("#pause").onclick = function()
        {
            pauseStream(audioElement);
        }
        document.querySelector("#volume").onchange = function(e)
        {
            volume = e.target.value / 100;
            audioElement.volume = volume;
        }
        document.querySelector("#navigationToggle").onclick = function()
        {
            controls.classList.toggle('invisible');
        };
        document.querySelector('#maxRadius').onchange = function(e)
        {
            circleRadius = parseInt(e.target.value);
        }
        document.querySelector('#motionBlur').onchange = function(e)
        {
            motionBlur = parseInt(e.target.value) / 100;
        }
        document.querySelector('#circleToggle').onchange = function(e)
        {
            drawCircle = e.target.checked;
        }
        document.querySelector('#spinnerToggle').onchange = function(e)
        {
            drawSpinner = e.target.checked;
        }
        document.querySelector('#barToggle').onchange = function(e)
        {
            drawBars = e.target.checked;
        }
        document.querySelector('#lineToggle').onchange = function(e)
        {
            drawLines = e.target.checked;
        }
		document.querySelector('#particles').onchange = function(e)
        {
            particles = e.target.checked;
        }
		document.querySelector('#backParticles').onchange = function(e)
        {
            backParticles = e.target.checked;
        }
    }

    //Custom functionality to replace the original audio controls
    //Checks to see wheather the current song playing is paused and or changed
    //If changed then play the new song, otherwise resume play of the current song
    //Just a simple design preference to not use basic audio control scheme
    function playStream(audioElement,path)
    {
        if(paused && currentTrack == trackSrc.value)
        {
            audioElement.play();
            audioElement.currentTime = pausedTime;
            audioElement.volume = volume;
            paused = false;
        }
        else
        {
            currentTrack = path;
            audioElement.src = path;
            audioElement.play();
            audioElement.volume = volume;
        }
    }
    function pauseStream(audioElement,path)
    {
        pausedTime = audioElement.currentTime;
        audioElement.volume = 0;
        audioElement.pause();
        paused = true;
    }
		
    function update() 
    { 
        requestAnimationFrame(update);
        // create a new array of 8-bit integers (0-255)
        
        
        var data = new Uint8Array(NUM_SAMPLES/2); 
        analyserNode.getByteFrequencyData(data);
		
        
        // OR
        //analyserNode.getByteTimeDomainData(data); // waveform data
        ctx.fillStyle = makeColorHSLA(currentHue, 75, 65, motionBlur);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        
        ctx.save();
            var grad = ctx.createRadialGradient(canvas.width/2,(canvas.height / 2) * 3.25, canvas.width * 0.20, canvas.width / 2,canvas.height * 2,canvas.width * 0.5);
            grad.addColorStop(0,makeColorHSLA(currentHue, 75, 65, motionBlur));
            grad.addColorStop(1,"transparent");
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = grad;
            ctx.save();
                ctx.scale(2, 1);
                ctx.translate(-canvas.width * 0.25, 0);
                ctx.beginPath();
                    ctx.moveTo(-canvas.width * 0.25, canvas.height);
                    ctx.bezierCurveTo(canvas.width * .25, canvas.height*0.65, canvas.width * 0.75, canvas.height*0.65, canvas.width + (canvas.width * 0.25), canvas.height);
                    ctx.fill();
                ctx.closePath();
            ctx.restore();
            grad = ctx.createRadialGradient(canvas.width/2,-(canvas.height / 2) * 1.5, canvas.width * 0.20, canvas.width / 2,-canvas.height,canvas.width * 0.5);
            grad.addColorStop(0,makeColorHSLA(currentHue, 75, 65, motionBlur));
            grad.addColorStop(1,"transparent");
            ctx.fillStyle = grad;
            ctx.save();
                ctx.scale(2, 1);
                ctx.translate(-canvas.width * 0.25, 0);
                ctx.beginPath();
                    ctx.moveTo(-canvas.width * 0.25, 0);
                    ctx.bezierCurveTo(canvas.width * .25, 225, canvas.width * 0.75, 225, canvas.width + (canvas.width * 0.25), 0);
                    ctx.fill();
                ctx.closePath();
            ctx.restore();
        ctx.restore();
		
		
        
        ctx.fillStyle = makeColorHSLA(currentHue - 100, 100, 50, 0.2);
        ctx.strokeStyle = makeColorHSLA(currentHue - 100, 100, 50, 0.2);
        
        if(drawBars)
        {
            ctx.save();
                for(var i=0; i<data.length; i++) 
                {
                    var height = (256- data[i]) - 256;

                    if(i > 5)
                    {
                        ctx.fillRect((0) + (i * 2) * (barWidth + barSpacing), canvas.height/2 , barWidth, -height/1.25);
                        ctx.fillRect((0) + (i * 2) * (barWidth + barSpacing), canvas.height/2 , barWidth, height/1.25);
                        ctx.fillRect((canvas.width) - (i * 2) * (barWidth + barSpacing), canvas.height/2 , barWidth, height/1.25);
                        ctx.fillRect((canvas.width) - (i * 2) * (barWidth + barSpacing), canvas.height/2 , barWidth, -height/1.25);
                    }
                }
            ctx.restore();
        }
            
        if(drawCircle)
        {
			//edited the code here, since there was an issue where the radius was ending up negative
				//due to data[] when the song ended
            ctx.save();
                ctx.beginPath();
					var rad = circleRadius;
					if(data[50] < 0)
						rad = circleRadius;
					else
						rad = data[50] + circleRadius;
                    ctx.arc(canvas.width / 2, canvas.height / 2, rad, 0, Math.PI*2);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            ctx.restore();
            ctx.restore();
        }
        if(drawSpinner)
        {
            ctx.beginPath();
            ctx.save();  
            rotation += 0.01 * ((256 - data[50]) / 50);
            if(rotation > 360)
            {
                rotation = 1;
            }
            chainSawEdges = (data[50] / 3);// + getRandNum(0, 10);
            ctx.shadowColor = makeColorHSLA(0, 0, 100, 0.2);
            ctx.shadowBlur = 1;
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(rotation);
            ctx.translate(-canvas.width/2, -canvas.height/2);
            for(var j = 0; j < 8; j++)
            {
                ctx.save();
                    ctx.translate(canvas.width/2,canvas.height/2);
                    ctx.rotate((((Math.PI * 2) / 8) * j));
                    ctx.scale(2,2);
                    ctx.translate(100, -100);
                    ctx.save();
                        ctx.moveTo(-25, -25);
                        ctx.quadraticCurveTo(chainSawEdges, 25, -chainSawEdges, 50);
                    ctx.restore();
                ctx.restore();
                ctx.lineWidth = 5;
                ctx.stroke();
            }
            ctx.restore();
            ctx.closePath();
        }
        if(drawLines)
        {
            ctx.beginPath();
            ctx.save();
                analyserNode.getByteTimeDomainData(data);
                ctx.moveTo(0, canvas.height*0.25);
                ctx.bezierCurveTo(canvas.width * .25, canvas.height*0.25  * (data[50] / 80), canvas.width * .75, canvas.height*0.25 * (data[50] / 80), canvas.width, canvas.height*0.25);
                ctx.stroke();
                ctx.moveTo(0, canvas.height*0.75);
                ctx.bezierCurveTo(canvas.width * .25, canvas.height*0.75  * (1.5 - (data[50] / 180)), canvas.width * .75, canvas.height*0.75 * (1.5 - (data[50] / 180)), canvas.width, canvas.height*0.75);
                ctx.stroke();
            ctx.restore();
            ctx.closePath();
            
        }
        // loop through the data and draw!
        //Particles
		if(particles)
        {
			particleEffects();
        }
            
        manipulatePixels();
        
        if(urlChanged)
        {
            document.querySelector("#startSong").click();
            urlChanged = false;
        }
    } 
    
	
	//A lot of this function was taken from:
		//http://learnsome.co/blog/particles/
	//I took this and understood it and used it.
	//Variations
		//Instead of at set intervals potential adding a particle
			//Added them all to the list at the beginning
		//used requestAnimationFrame() instead of setInterval()
		//also, played around with the colors
	function particleEffects()
	{	
		//create variables
			//an array of particles
			//the number of particles
			//an object with a bunch of starting values
		var particles = {},
			particleIndex = 0,
			settings = 
            {
				density: 1,
				particleSize: 50,
				startingX: Math.random() * canvas.width,
				startingY: canvas.height - 50,
				gravity: 0.5,
				maxLife: 30
			};
			
		//a function that creates a particle/a base class for an object
			//when you say new Particle() this will be called - essentially a constructor
		function Particle()
		{
			//set starting positions and velocities
			this.x = settings.startingX;
			this.y = settings.startingY;
			
			//Random X and Y velocities
			this.vx = Math.random() * 20 - 10;
			this. vy = Math.random() * 20 - 5;
			
			
			//Add new particle
			particleIndex++;
			particles[particleIndex] = this;
			this.id = particleIndex;
			this.life = 0;
		}
		
		//a function to be called when you call the draw function of a particle
		Particle.prototype.draw = function(data)
		{
			//incrementing position
			this.x += this.vx;
			this.y += this.vy;
			
			//dealing with gravity
			this.vy += settings.gravity;
			
			//increasing the life of a particle
			this.life++;
			
			//have the particle leave after a set amount of time
			if(this.life >= settings.maxLife)
			{
				delete particles[this.id];
                delete particles[this]
			}
			
			if(backParticles == true)
			{
				var grad = ctx.createRadialGradient(canvas.width/2,(canvas.height / 2) * 3.25, canvas.width * 0.20, canvas.width / 2,canvas.height * 2,canvas.width * 0.5);
				grad.addColorStop(0,"transparent");
				grad.addColorStop(1,makeColorHSLA(currentHue, 75, 75, motionBlur));
				ctx.fillStyle = grad;
			}
			else
			{
				//three different variables, so that each is different
				var h = Math.round(Math.random()*255);
				var s = Math.round(Math.random()*255);
				var l = Math.round(Math.random()*255);
				
				ctx.fillStyle = makeColorHSLA(h, s, l, 0.2);
			}
			
			ctx.beginPath();
			ctx.arc(this.x, this.y, settings.particleSize, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		
		//fills the array with Particles
		for(var i = 0; i < settings.density; i++)
		{
			new Particle();
		}
		
		//a function that draws all the particles
			//and makes it so that this will run each frame
		var drawParticle = function()
		{			
			for(var i in particles)
			{
				particles[i].draw();
			}
			
			requestAnimationFrame(drawParticle);
		}
		
		drawParticle();
		
		
	}//end of particleEffects()
	
    function manipulatePixels()
    {
        /*var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var length = data.length;
        var width = imageData.width;
        for(var i = 0; i < length; i += 4)
        {
            if(tintRed)
            {
                data[i] = data[i] + 100;
            }
            if(invert)
            {
                var red = data[i];
                var green = data[i+1];
                var blue = data[i+2];
                data[i] = 255 - red;
                data[i+1] = 255 - green;
                data[i+2] = 255 - blue;
            }
            if(noise && Math.random() < 0.10)
            {
                data[i] = data[i+1] = data[i+2] = 128;
                //data[i+3] = 255; //alpha
            }
            if(lines)
            {
                var row = Math.floor(i/4/width);
                if(row % 50 == 0)
                {
                    data[i] = data[i+1] = data[i+2] = data[i+3] = 255;
                    data[i+(width*4)] = data[i+(width*4)+1] = data[i+(width*4)+2] = data[i+(width*4)+3] = 255;
                }
            }
            if(threshold)
            {
                data[i] = data[i+1] = data[i+2] = (data[i]*0.2126 + data[i+1]*0.7152 + data[i+2]*0.0722) ? 255:0;
            }
        }
        ctx.putImageData(imageData, 0, 0);*/
    }
    
		// HELPER
    function makeColor(red, green, blue, alpha)
    {
   	    var color='rgba('+red+','+green+','+blue+', '+alpha+')';
   	    return color;
    }
    
    function makeColorHSL(hue, sat, brightness)
    {
        return 'hsl(' + hue + ',' + sat + '%,' + brightness + '%)';
    }
    function makeColorHSLA(hue, sat, brightness,alpha)
    {
        return 'hsla(' + hue + ',' + sat + '%,' + brightness + '%,' + alpha + ')';
    }
		
		 // FULL SCREEN MODE
    function requestFullscreen(element) 
    {
        if (element.requestFullscreen) 
        {
            element.requestFullscreen();
        } 
        else if (element.mozRequestFullscreen) 
        {
            element.mozRequestFullscreen();
        }
        else if (element.mozRequestFullScreen) // camel-cased 'S' was changed to 's' in spec
        {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) 
        {
            element.webkitRequestFullscreen();
        }
			// .. and do nothing if the method is not supported
    };
    
    function getRandNum(min, max) 
    {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
		
    window.addEventListener("load",init);
}());