var SpeedReader = function() {
	var parser = this.parser = new SpeedReader.Parser();
	var reader = this.reader = new SpeedReader.Reader(parser);
	var player = this.player = new SpeedReader.Player(reader);
	
	$(document).on('keypress', null, 'space', function() {
		reader.toggle();
	});
	
	$(document).on('keydown', null, 'right', function() {
		reader.index(reader.index() + 1);
	});
	
	$(document).on('keydown', null, 'left', function() {
		reader.index(reader.index() - 1);
	});
	
	$(document).on('keydown', null, 'up', function() {
		reader.delay(reader.delay() - 10);
	});
	
	$(document).on('keydown', null, 'down', function() {
		reader.delay(reader.delay() + 10);
	});
}

SpeedReader.Word = function(index, data, offset) {
	this.value = data || '';
	this.delay = offset || 0;
	this.format = null;
}

SpeedReader.Parser = function() {
	var parser = this;
	var onLoad = this.onLoad = function(action) {
		console.log(onLoad, action);
		onLoad = action;
	}
	var onParse = this.onParse = function(action) {
		onParse = action;
	}
	
	var words = this.words = function () {
		return words;
	}
	
	var parse = this.parse = function(text) {
		load(text);
		onParse(text);
	}
	
	var load = this.load = function(text) {
		words = new Array();
			
		var pairedStartCharacters = ['(', '{', '[', '"', '<'];
		var pairedEndCharacters = [')', '}', ']', '"', '>'];
		var punctuationCharacters = ['.', '!', '?', ':', ';'];
						
		var currentFormatters = new Array();
		var word = new SpeedReader.Word();
		var format = function() {
			this.start = null,
			this.end = null
		}
				
		var addWord = function() {
			if( word.value ) {
				if(currentFormatters.length) {
					word.format = new Array();
					
					$(currentFormatters).each(function(index, value) {
						var result = new format();
						var indexOf = pairedStartCharacters.indexOf(value);
						result.start = pairedStartCharacters[indexOf];
						result.end = pairedEndCharacters[indexOf];
						word.format.push(result);
					});
				}
				words.push(word);
				word = new SpeedReader.Word();
			}
		}
		
		function isInFormatters(value) {
			var result = false;

			if(currentFormatters.indexOf(value) != -1) {
				result = true;
			}
			
			return result;
		}
		
		for(var i = 0, length = text.length; i < length; i++) {
			var character = text[i];
			var endCharacterIndex = pairedEndCharacters.indexOf(character) ;
			var startCharacterIndex = pairedStartCharacters.indexOf(character);
			var matchingStartCharacterIndex;
			
			if(endCharacterIndex != -1) {
				matchingStartCharacterIndex = pairedStartCharacters[endCharacterIndex];
			}

			if(endCharacterIndex != -1 && isInFormatters(matchingStartCharacterIndex) == true) {
				addWord();
				currentFormatters.splice(currentFormatters.indexOf(matchingStartCharacterIndex));
			}
			else if(startCharacterIndex != -1) {
				currentFormatters.push(character);
			}
			else if(punctuationCharacters.indexOf(character) != -1) {
				word.delay += 2;
				addWord();
			}
			else if(character.match(/\W/)) {
				addWord();
			}
			else {
				word.value += character;
			}			
		}
		
		addWord();		
		parser.onLoad(text);
		console.log(words);
	};
}

SpeedReader.Reader = function(parser) {
	
	var parser = this.parser = parser;
	
	var onChange = this.onChange = function(action) {
		onChange = action;
	};
	var onComplete = this.onComplete = function(action) {
		onComplete = action;
	};
	var states = this.states = {
		loaded: "Loaded",
		playing: "Playing",
		paused: "Paused",
		complete: "Complete"
	};
	var state = this.state = (function() {
		
		var _state = states.loaded;
		
		return function(value) {
			if(value) {
				_state = value;
				onChange("state", value);
			}
			return _state;
		};
	})();
	
	var index = this.index = (function() {
		
		var _index = 0;
		
		return function(value) {
			if(value != null) {
				if(parser.words() && value >= 0 && value < parser.words().length) {
					_index = value;
					onChange("index", _index);
				}
			}					
			return _index;
		}
	})();
	
	var delay = this.delay = (function() {
		
		var _delay = 200;
		
		return function(value) {
			if(value) {
				if(value <= 300 && value > 50) {
					_delay = value;
					onChange("speed", value);
				}
			}
			return _delay;
		};
	})();

	var play = this.play = function logicLoop() {
		
		index(index() + 1);
		
		if(state() == states.playing) {
			var currentDelay = delay();
			
			if(index() ==  parser.words().length - 1) {
				state(states.complete);
				return;
			}
			
			currentDelay += (parser.words()[index()].delay) * delay();
			window.setTimeout(logicLoop, currentDelay);
		}
	};
	
	var toggle = this.toggle = function() {
		
		if(state() == states.playing) {
			state(states.paused);
		}
		else if(state() == states.paused) {
			state(states.playing);
			play();
		}
	}
	
	var start = this.start = function () {
		index(0);
		state(states.playing);
		play();
	};
	var stop = this.stop = function () {
		state(states.paused);
	};
	var reset = this.reset = function () {
		state(states.loaded);
		isPlaying = !(isComplete = false);
		index(0);
	};
}

SpeedReader.Player = function(reader) {
	reader.delay(200);
	reader.index(0);
	
	var initialText = "To use this widget, copy/paste some text into this text field.  Alternatively, use the \"Choose File\" button up above to load a text document into this text field.  After loading some text, press the play button to begin.  Certain kinds of text will show up formatted (as you may have previously noted with the quotes).";
	
	var width = this.width = function(value) {
		$div.width(value);
		$loader.width(value);
		$reader.width(value);
		$canvas.width(value);
		
		$textarea.width(value);
		$controls.width(value);
	}
	var height = this.height = function(value) {
		$div.height(value);
		$loader.height(value);
		$reader.height(value);
		$canvas.height(value);
	}
		
	var $div = $("<div/>")
		.addClass("player");
	var $canvas = $("<canvas/>");
	var canvas = $canvas[0];
	var context = canvas.getContext('2d');
	
	var $loader = $("<div/>")
		.addClass("loader content")
		.appendTo($div);
	var $loaderHeader = $("<div/>")
		.addClass(".header")
		.appendTo($loader);
	var $loaderHeaderButton = $("<input/>")
		.attr("type", "file")
		.attr("accept", ".txt")
		.appendTo($loaderHeader);
	var $textarea = $("<textarea/>")
		.addClass("text")
		.text(initialText)
		.on("input propertychange", null, function() {
			var text = $(this).val();
			reader.parser.parse(text);
		}).appendTo($loaderHeader);

	var $reader = $("<div/>")
		.addClass("reader content")
		.click(reader.toggle)
		.appendTo($div);
		
	$canvas.appendTo($reader);
	
	var $indexSlider = $("<div/>")
		.addClass("index-slider slider")
		.slider({
			range: "min",
			min: 0,
			max: 0,
			value: 0,
			slide: function(event, ui) {
				var value = $(this).slider("value");
				reader.index(value);
				reader.stop();
				$playBtn.text("Play");
			}
		}).appendTo($div);

	var $controls = $("<div/>")
		.addClass("controls")
		.appendTo($div);
	var $playBtn = $("<button/>")
		.addClass("play-btn")
		.text("Play")
		.click(function() {
			$reader.css('display', 'block');
			$loader.css('display', 'none');
			
			var state = reader.state();
			
			switch(state) {
				case reader.states.loaded:
				case reader.states.complete:
					reader.start();
					break;
				case reader.states.playing:
				case reader.states.paused:
					reader.toggle();
					break;
				default:
					break;
			}
		}).appendTo($controls);
		
	var $speedSlider = $("<div/>")
		.addClass("speed-slider slider")
		.slider({
			range: "min",
			min: 50,
			max: 300,
			value: 100,
			slide: function(event, ui) {
				var maxSpeed = 300;
				var speed = maxSpeed - ui.value;
				reader.delay(speed);
		}}).appendTo($controls);
		
		
	var $indexLabels = $("<span/>")
		.addClass("index-labels")
		.appendTo($controls);
	var $currentIndexLabel = $("<label/>")
		.addClass("current-index")
		.appendTo($indexLabels);
	$("<label/>")
		.text("/")
		.appendTo($indexLabels);
	var $wordCountLabel = $("<label/>")
		.addClass("word-count")
		.appendTo($indexLabels);
		
	var $fullScreenResizeBtn = $("<button/>")
		.addClass("full-screen-resize-btn float-right")
		.text("Full Screen")
		.click(function() {
			var pfx = ["webkit", "moz", "ms", "o", ""];

			var requestFullScreen = function(obj, method) {
		
				var p = 0, m, t;
				
				while (p < pfx.length && !obj[m]) {
					m = method;
					
					if (pfx[p] == "") {
						m = m.substr(0,1).toLowerCase() + m.substr(1);
					}
					
					m = pfx[p] + m;
					t = typeof obj[m];
					
					if (t != "undefined") {
						pfx = [pfx[p]];
						return (t == "function" ? obj[m]() : obj[m]);
					}
					
					p++;
				}

			}
			
			if(requestFullScreen(document, "FullScreen") || requestFullScreen(document, "IsFullScreen")) {
				requestFullScreen(document, "CancelFullScreen");
			}
			else {
				console.log("going fullscreen");
				requestFullScreen($div[0], "RequestFullScreen");
			}
		}).appendTo($controls);
		
	var $largeResizeBtn = $("<button/>")
		.addClass("large-resize-btn float-right")
		.text("large player")
		.click(function() {
			width(1280);
			height(720);
		}).appendTo($controls);
	var $smallResizeBtn = $("<button/>")
		.addClass("small-resize-btn float-right")
		.text("small player")
		.click(function() {
			width(600);
			height(400);
		}).appendTo($controls);
	var $optionsBtn = $("<button/>")
		.addClass("options-btn float-right")
		.text("settings")
		.click(function () {
			var condition = $loader.css('display') == "none";
			if(condition) { 
				reader.stop();
				$reader.css('display', 'none');
				$loader.css('display', 'block');
			}
			else {
				$reader.css('display', 'block');
				$loader.css('display', 'none');
			}
		}).appendTo($controls);
		
		
	$loaderHeaderButton.change(function () {
		var reader = new FileReader();
		var fileInput = this;
		var files = fileInput.files;
		var file = files[0];
		reader.readAsText(file);
		
		reader.onload = (function(theFile) {
			return function(e) {
				reader.reset();
				$textarea.text(e.target.result);
				reader.read(e.target.result);
			};
		})(file);
	});

	var onDraw = this.onDraw = function(action) {
		onDraw = action;
	};

	reader.parser.onParse(function(text) {
		$currentIndexLabel.text(reader.index());
		$wordCountLabel.text(reader.parser.words().length - 1);
		$indexSlider.slider("option", "max", reader.parser.words().length - 1);
	});
	
	reader.onChange(function(arg, value) {
		switch(arg) {
			case "index":
				$currentIndexLabel.text(value);
				$indexSlider.slider('value', value);
				draw();
				break;
			case "speed":				
				var convertedValue = 300 - value;
				$speedSlider.slider('value', convertedValue);
				break;
			case "state":
				switch(value) {
					case reader.states.playing:
						$playBtn.text("Pause");
						break;
					case reader.states.loaded:
					case reader.states.paused:
						$playBtn.text("Play");
						break;
					case reader.states.complete:
						$playBtn.text("Reset");
						break;
				}
				break;
		}
	});
	
	var draw = this.draw = function () {
		
		var word = reader.parser.words()[reader.index()];
		console.log("drawing " + word.value);
		canvas.width = $(canvas).width();
		canvas.height = $(canvas).height();
		
		var x = canvas.width / 2;
		var y = canvas.height / 2 + 15;
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.font = '60px Calibri';
		context.textAlign = 'center';
		context.baseLine = 'center';
		context.fillStyle = "#999";
		context.fillText(word.value, x, y, canvas.width);
		
		$(word.format).each(function(index, value) {
			context.fillText(value.start, 10 * (index + 1), y);
			context.fillText(value.end, canvas.width - (10 * (index + 1)), y);
		});
	}
	
	reader.parser.parse($textarea.text());

	return $div;
}