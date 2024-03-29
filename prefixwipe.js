/*
 * 作者：k849996781@vip.qq.com
 * 时间：2015-07-31
 * 描述：js添加css样式去前缀
 * 
 * 版本:0.1
 * 版本说明：本版本为初始设计版本，结构上，语法上的许多不足将在以后的新版本改进
 * 
 *  GitHub ：  https://github.com/kongdewen1994/prefixwipe.js.git
 * */


var self = {}

self.properties = [];
self.properties2 = [];


(function() {

	if (!window.addEventListener) {
		return;
	}

	window.addEventListener('DOMContentLoaded', function() {

		var oScriptArr = [].slice.call(document.querySelectorAll('script')).slice(0, -1);

		oScriptArr.forEach(pr_init);

	}, false);


	function fix(what, before, after, replacement, js) {

		for (var i = 0; i < what.length; i++) {
			self.properties2.push(camelCase(what[i]));
		}

		if (what.length > 0) {
			var regex = RegExp(before + '(' + self.properties2.join('|') + ')' + after, 'gi');
			
			js = js.replace(regex, function(replacement) {
				
				return '.' + self.prefix2 + toUp2(replacement);
			});
		}
		return js;
	}


	function toUp(str) {

		var str2;

		for (var j = 0; j < str.length; j++) {
			
			var ch2 = str.charAt(j);

			if (j == 0) {
				
				str2 = ch2.toUpperCase();	
			} else {
				
				str2 += ch2.toLowerCase();
			}
		}

		return str2;
	}

	function toUp2(str) {

		var str2;

		for (var j = 0; j < str.length; j++) {
			
			var ch2 = str.charAt(j);

			if (j == 1) {
				str2 = ch2.toUpperCase();
				
			} else {
				
				str2 += ch2;
			}
		}

		return str2;
	}


	function camelCase(str) {
		return str.replace(/-([a-z])/g, function($0, $1) {
			return $1.toUpperCase();
		}).replace('-', '');
	}


	function pr_init(script) {

		try {

			if (script.type !== 'text/javascript') {
				
				return;
			}
		} catch (e) {
			return;
		}

		var url = script.src, 
			base = url.replace(/[^\/]+$/, ''), 
			base_scheme = (/^[a-z]{3,10}:/.exec(base) || [''])[0], 
			base_domain = (/^[a-z]{3,10}:\/\/[^\/]+/.exec(base) || [''])[0], 
			base_query = /^([^?]*)\??/.exec(url)[1], 
			parent = script.parentNode, 
			xhr = new XMLHttpRequest(),
			process;

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {

				process();
			}
		};

		process = function() {

			var js = xhr.responseText;

			if (js && script.parentNode && (!xhr.status || xhr.status < 400 || xhr.status > 600)) {

				js = fix(self.properties, '(\.)', '()', '$1' + self.prefix2 + '$2', js);
				
				var oScript = document.createElement('script');
				oScript.textContent = js;
				parent.insertBefore(oScript, script);
				parent.removeChild(script);
				
				script.type = 'text/javascript';
				
				setTimeout(function(){
					pw();
				},30);

			}
		};



		try {
			xhr.open('GET', url);
			xhr.send(null);
		} catch (e) {
			
			if (typeof XDomainRequest != "undefined") {
				xhr = new XDomainRequest();
				xhr.onerror = xhr.onprogress = function() {};
				xhr.onload = process;
				xhr.open("GET", url);
				xhr.send(null);
			}
		}
	}


})();


(function() {

	var style = getComputedStyle(document.documentElement, null);
	var dummy = document.createElement('div').style;

	var properties = [];
	var properties2 = [];

	var parts;
	var prefix;

	var iterate = function(property) {

			if (property.charAt(0) == '-') {
				properties.push(property);

				parts = property.split('-');
				prefix = parts[1];

				while (parts.length > 3) {

					parts.pop();
					var shorthand = parts.join('-');

					if (supported(shorthand) && properties.indexOf(shorthand) === -1) {
						
						properties.push(shorthand);
					}
				}
			}
		},

		supported = function(property) {
			return camelCase(property) in dummy;
		},

		camelCase = function(str) {
			return str.replace(/-([a-z])/g, function($0, $1) {
				return $1.toUpperCase();
			}).replace('-', '');
		},

		toUp = function(str) {

			var str2;

			for (var j = 0; j < str.length; j++) {
				
				var ch2 = str.charAt(j);

				if (j == 0) {
					
					str2 = ch2.toUpperCase();	
				} else {
					
					str2 += ch2.toLowerCase();
				}
			}

			return str2;
		}

	if (style.length > 0) {

		for (var i = 0; i < style.length; i++) {
			
			iterate(style[i]);
		}
	}


	self.prefix = '-' + prefix + '-';
	self.prefix2 = toUp(prefix);


	for (var i = 0; i < properties.length; i++) {
		var property = properties[i];

		if (property.indexOf(self.prefix) === 0) {

			var unprefixed = property.slice(self.prefix.length);

			if (!supported(unprefixed)) {
				
				self.properties.push(unprefixed);
			}
		}
	}


})()