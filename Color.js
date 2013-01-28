var scope = window;
(function (scope) {
	"use strict";
	var Math = window.Math;
	function wrap(val, min, max) {
		if (!(val < min || val >= max)) { return val; }
		while (val < min) { val += max - min; }
		return min + (val - min) % (max - min);
	}
	function clip(val, min, max) {
		return Math.min(Math.max(val, min), max);
	}
	function Color(model, color) {
		if (typeof model === 'object' && model.length) {
			color = model;
			model = "RGB";
		}
		// setup
		this.model = this.model(model);
		this.color = this.color(color);
		this.hook = this.hook();
	}
	/*jslint bitwise: true*/
	Color.prototype.valueOf = function () {
		var rgb = this.convert("RGB", this.color());
		return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
	};
	/*jslint bitwise: false*/
	Color.prototype.getColorByName = (function () {
		/* list of named colors */
		var colors = { aliceblue: "#F0F8FF", antiquewhite: "#FAEBD7", aqua: "#00FFFF", aquamarine: "#7FFFD4", azure: "#F0FFFF", beige: "#F5F5DC", bisque: "#FFE4C4", black: "#000000", blanchedalmond: "#FFEBCD", blue: "#0000FF", blueviolet: "#8A2BE2", brown: "#A52A2A", burlywood: "#DEB887", cadetblue: "#5F9EA0", chartreuse: "#7FFF00", chocolate: "#D2691E", coral: "#FF7F50", cornflowerblue: "#6495ED", cornsilk: "#FFF8DC", crimson: "#DC143C", cyan: "#00FFFF", darkblue: "#00008B", darkcyan: "#008B8B", darkgoldenrod: "#B8860B", darkgray: "#A9A9A9", darkgreen: "#006400", darkkhaki: "#BDB76B", darkmagenta: "#8B008B", darkolivegreen: "#556B2F", darkorange: "#FF8C00", darkorchid: "#9932CC", darkred: "#8B0000", darksalmon: "#E9967A", darkseagreen: "#8FBC8B", darkslateblue: "#483D8B", darkslategray: "#2F4F4F", darkturquoise: "#00CED1", darkviolet: "#9400D3", deeppink: "#FF1493", deepskyblue: "#00BFFF", dimgray: "#696969", dodgerblue: "#1E90FF", firebrick: "#B22222", floralwhite: "#FFFAF0", forestgreen: "#228B22", fuchsia: "#FF00FF", gainsboro: "#DCDCDC", ghostwhite: "#F8F8FF", gold: "#FFD700", goldenrod: "#DAA520", gray: "#808080", green: "#008000", greenyellow: "#ADFF2F", honeydew: "#F0FFF0", hotpink: "#FF69B4", indianred: "#CD5C5C", indigo: "#4B0082", ivory: "#FFFFF0", khaki: "#F0E68C", lavender: "#E6E6FA", lavenderblush: "#FFF0F5", lawngreen: "#7CFC00", lemonchiffon: "#FFFACD", lightblue: "#ADD8E6", lightcoral: "#F08080", lightcyan: "#E0FFFF", lightgoldenrodyellow: "#FAFAD2", lightgray: "#D3D3D3", lightgreen: "#90EE90", lightpink: "#FFB6C1", lightsalmon: "#FFA07A", lightseagreen: "#20B2AA", lightskyblue: "#87CEFA", lightslategray: "#778899", lightsteelblue: "#B0C4DE", lightyellow: "#FFFFE0", lime: "#00FF00", limegreen: "#32CD32", linen: "#FAF0E6", magenta: "#FF00FF", maroon: "#800000", mediumaquamarine: "#66CDAA", mediumblue: "#0000CD", mediumorchid: "#BA55D3", mediumpurple: "#9370DB", mediumseagreen: "#3CB371", mediumslateblue: "#7B68EE", mediumspringgreen: "#00FA9A", mediumturquoise: "#48D1CC", mediumvioletred: "#C71585", midnightblue: "#191970", mintcream: "#F5FFFA", mistyrose: "#FFE4E1", moccasin: "#FFE4B5", navajowhite: "#FFDEAD", navy: "#000080", oldlace: "#FDF5E6", olive: "#808000", olivedrab: "#6B8E23", orange: "#FFA500", orangered: "#FF4500", orchid: "#DA70D6", palegoldenrod: "#EEE8AA", palegreen: "#98FB98", paleturquoise: "#AFEEEE", palevioletred: "#DB7093", papayawhip: "#FFEFD5", peachpuff: "#FFDAB9", peru: "#CD853F", pink: "#FFC0CB", plum: "#DDA0DD", powderblue: "#B0E0E6", purple: "#800080", red: "#FF0000", rosybrown: "#BC8F8F", royalblue: "#4169E1", saddlebrown: "#8B4513", salmon: "#FA8072", sandybrown: "#F4A460", seagreen: "#2E8B57", seashell: "#FFF5EE", sienna: "#A0522D", silver: "#C0C0C0", skyblue: "#87CEEB", slateblue: "#6A5ACD", slategray: "#708090", snow: "#FFFAFA", springgreen: "#00FF7F", steelblue: "#4682B4", tan: "#D2B48C", teal: "#008080", thistle: "#D8BFD8", tomato: "#FF6347", turquoise: "#40E0D0", violet: "#EE82EE", wheat: "#F5DEB3", white: "#FFFFFF", whitesmoke: "#F5F5F5", yellow: "#FFFF00", yellowgreen: "#9ACD32" };
		return function getColorByName(name) {
			return this.hexadecimal(colors[name] || null);
		};
	}());
	Color.prototype.normalize = function (max) {
		var color = this.color(), i, len, ret = [];
		max = max || this.settings("maximum") || [255, 255, 255];
		for (i = 0, len = color.length; i < len; i += 1) {
			ret[i] = color[i] / max[i];
		}
		return ret;
	};
	Color.prototype.validate = function (color) {
		var max, min, oor, prec, i, len;
		color = color || this.color();
		max = this.settings("maximum");
		min = this.settings("minimum");
		oor = this.settings("outOfRange");
		prec = this.settings("precision");
		for (i = 0, len = color.length; i < len; i += 1) {
			if (prec !== undefined) {
				color[i] = Math.round(color[i] / prec[i]) * prec[i];
			}
			if (oor && (color[i] > max[i] || color[i] < min[i])) {
				if (oor[i] === 'clip') { color[i] = clip(color[i], min[i], max[i]); }
				if (oor[i] === 'wrap') { color[i] = wrap(color[i], min[i], max[i]); }
			}
		}
		return color;
	};
	Color.prototype.hexadecimal = function (input) {
		var type = typeof input, hex, rgb, offset = 0;
		if (input === null || input === undefined) { return null; }
		if (type === 'object') {
			// from RGB
			// TODO
			hex = "";
			return;
		}
		if (type === 'string') {
			// to RGB
			if (input.charAt(0) === '#') { input = input.substr(1); }
			if (input.length === 3) { input = input.charAt(0) + input.charAt(0) + input.charAt(1) + input.charAt(1) + input.charAt(2) + input.charAt(2); }
			if (input.length !== 6) { return null; }
			rgb = [
				parseInt(input.substr(offset, 2), 16),
				parseInt(input.substr(2 + offset, 2), 16),
				parseInt(input.substr(4 + offset, 2), 16)
			];
			return rgb;
		}
	};
	Color.prototype.color = function (c) {
		var color = [], i, len;
		if (c === undefined) { c = this.settings("minimum"); }
		for (i = 0, len = c.length; i < len; i += 1) {
			color[i] = c[i];
		}
		return function setColor(channels) {
			var type, i, len;
			if (channels === undefined) { return color; }
			type = typeof channels;
			if (type === 'object' && channels.length) {
				color = [];
				for (i = 0, len = channels.length; i < len; i += 1) {
					color[i] = channels[i];
				}
			}
			if (type === 'string') { color = this.getColorByName(channels); }
			if (type === 'number') {
				/*jslint bitwise: true*/
				color = [ channels >> 16 & 0xFF, (channels - ((channels >> 16) << 16) >> 8) & 0xFF, (channels - ((channels >> 8) << 8)) & 0xFF ];
				/*jslint bitwise: false*/
			}
			color = this.validate(color);
			this.hook("onChangeColor").fire();
			return this;
		};
	};
	Color.prototype.model = function (model) {
		model = model || "RGB";
		return function setModel(set, cvt) {
			if (set === undefined) {
				return model;
			}
			if (typeof cvt === 'function') {
				return this.convert(model, set, cvt);
			}
			model = set;
			return this;
		};
	};
	Color.prototype.hook = (function () {
		function Hook(object) {
			this.object = object;
			this.hooks = [];
		}
		Hook.prototype.fire = function () {
			var i, len = this.hooks.length;
			for (i = 0; i < len; i += 1) {
				if (this.hooks[i].apply(this.object, arguments) === false) {
					return;
				}
			}
		};
		Hook.prototype.add = function (func) {
			this.hooks[this.hooks.length] = func;
			return func;
		};
		Hook.prototype.remove = function (func) {
			var i, len = this.hooks.length;
			for (i = 0; i < len; i += 1) {
				if (this.hooks[i] === func) {
					this.hooks[i] = undefined;
				}
			}
		};
		return function setHook() {
			var hooks = {};
			return function setHook(hook, func) {
				if (hook === undefined) { return hooks; }
				if (hooks[hook] === undefined) {
					hooks[hook] = new Hook(this);
				}
				if (func === undefined) {
					return hooks[hook];
				}
				return hooks[hook].add(func);
			};
		};
	}());
	Color.prototype.set = function set(model) {
		this.color(model, this.convert(model));
		return this;
	};
	Color.prototype.max = function (inc) {
		var color = this.color(), i = 0, len = color.length, max = color[0];
		for (i; i < len; i += 1) {
			if (color[i] > max) {
				max = color[i];
			}
		}
		if (inc === undefined) { return max; }
		for (i = 0, len = inc.length; i < len; i += 1) {
			if (inc[i] > max) {
				max = inc[i];
			}
		}
		return max;
	};
	Color.prototype.min = function (inc) {
		var color = this.color(), i = 0, len = color.length, min = color[0];
		for (i; i < len; i += 1) {
			if (color[i] < min) {
				min = color[i];
			}
		}
		if (inc === undefined) { return min; }
		for (i = 0, len = inc.length; i < len; i += 1) {
			if (inc[i] < min) {
				min = inc[i];
			}
		}
		return min;
	};
	Color.prototype.settings = (function () {
		var settings = {};
		return function modelSetting(setting, value) {
			var model = this.model();
			if (settings[model] === undefined) { settings[model] = {}; }
			if (setting === undefined) { return settings[model]; }
			if (value === undefined) { return settings[model][setting]; }
			settings[model][setting] = value;
			return this;
		};
	}());
	Color.prototype.convert = (function () {
		var cvt = { RGB: {}, HSV: {}, HSL: {}, YUV: {}, LAB: {}, HEX: {} };
		return function convert(model, conversion) {
			var cModel = this.model();
			if (cModel === model) { return this.color(); }
			if (model === undefined) { throw new Error("model is undefined."); }
			if (conversion && typeof conversion === 'function') { cvt[cModel][model] = conversion; return; }
			if (cvt[cModel] === undefined || cvt[cModel][model] === undefined) { throw new Error("No function to convert from " + cModel + " to " + model + "."); }
			return cvt[cModel][model](this.color());
		};
	}());
	Color.prototype.shift = function (increase) {
		var i, len, shiftBy, color = this.color(), type;
		shiftBy = arguments.length > 1 ? arguments : increase || 0;
		type = typeof shiftBy;
		for (i = 0, len = color.length; i < len; i += 1) {
			color[i] += type === 'object' ? shiftBy[i] : shiftBy;
		}
		this.validate();
		return this;
	};
	Color.prototype.amplify = function (amplitude) {
		var i, len, ampBy, color = this.color(), type;
		ampBy = arguments.length > 1 ? arguments : amplitude || 1;
		type = typeof ampBy;
		for (i = 0, len = color.length; i < len; i += 1) {
			color[i] = color[i] * (type === 'object' ? ampBy[i] : ampBy);
		}
		return this;
	};
	Color.prototype.complement = function () {
		var model = this.model(), hsv = new Color("HSV", this.convert("HSV"));
		hsv.shift(+180, 0, 0);
		return new Color(model, hsv.convert(model));
	};
	Color.prototype.closest = function (values) {
		var color = this.color(), ret, dist, cdist, i, j, leni, lenj, data = arguments.length > 1 ? arguments : (values.length > 1 && (typeof values[0] === 'object' && values[0].length)) ? values : arguments;
		for (i = 0, leni = data.length; i < leni; i += 1) {
			cdist = 0;
			for (j = 0, lenj = color.length; j < lenj; j += 1) {
				cdist += Math.pow(color[j] - data[i][j], 2);
			}
			if (dist === undefined || cdist < dist) {
				dist = cdist;
				ret = data[i];
			}
		}
		return ret;
	};
	Color.prototype.furthest = function (values) {
		var color = this.color(), ret, dist, cdist, i, j, leni, lenj, data = arguments.length > 1 ? arguments : (values.length > 1 && (typeof values[0] === 'object' && values[0].length)) ? values : arguments;
		for (i = 0, leni = data.length; i < leni; i += 1) {
			cdist = 0;
			for (j = 0, lenj = color.length; j < lenj; j += 1) {
				cdist += Math.pow(color[j] - data[i][j], 2);
			}
			if (dist === undefined || cdist > dist) {
				dist = cdist;
				ret = data[i];
			}
		}
		return ret;
	};
	Color.prototype.grayscale = function () {
		var ret = 0, color = this.convert("RGB");
		ret += 0.2126 * color[0];
		ret += 0.7152 * color[1];
		ret += 0.0722 * color[2];
		ret = Math.round(ret);
		return new Color(this.model(), new Color("RGB", [ ret, ret, ret ]).convert(this.model())).color();
	};
	Color.prototype.analogous = function () {
		/* untested */
		var analogousHueInterval = 12, analogousHueRange = 84, i, leni, color, colors = [];
		color = new Color("HSV", this.convert("HSV"));
		for (i = 0, leni = analogousHueRange / analogousHueInterval; i < leni; i += 1) {
			colors[i] = new Color(this.model(), color.shift((i - 6) * analogousHueInterval, 0, 0));
		}
		return colors;
	};
	// expose to window/scope
	scope.Color = Color;
}(scope));
(function convert(scope) {
	"use strict";
	/*globals Color*/
	var Color = scope.Color, color;
	/* RGB -> */
	color = new Color("RGB", [0, 0, 0]);
	color.convert("RGB", function (rgb) { return rgb; });
	color.convert("HSV", function (rgb) {
		var rgb_min, rgb_max, h, s, v;
		rgb = new Color("RGB", rgb);
		rgb_min = rgb.min();
		rgb_max = rgb.max();
		v = rgb_max / 255;
		if (v === 0) { h = s = 0; return new Color("HSV", [h, s, v]).color(); }
		rgb.amplify(1 / (v * 255));
		rgb_min = rgb.min();
		rgb_max = rgb.max();
		s = rgb_max - rgb_min;
		if (s === 0) { h = 0; return new Color("HSV", [h, s, v]).color(); }
		rgb.shift(-rgb_min);
		rgb.amplify(1 / s);
		rgb_min = rgb.min();
		rgb_max = rgb.max();
		rgb = rgb.color();
		h = (360 + (rgb_max === rgb[0] ? 60 * (rgb[1] - rgb[2]) : (rgb_max === rgb[1] ? 120 + 60 * (rgb[2] - rgb[0]) : (240 + 60 * (rgb[0] - rgb[1]))))) % 360;
		return new Color("HSV", [h, s, v]).color();
	});
	color.convert("HSL", function (rgb) {});
	color.convert("YUV", function (rgb) {
		var r = rgb[0], g = rgb[1], b = rgb[2];
		return new Color("YUV", [0.299 * r + 0.587 * g + 0.114 * b], [-0.14713 * r + -0.28886 * g + 0.436 * b], [0.615 * r + -0.51499 * g + -0.10001 * b]).color();
	});
	color.convert("LAB", function (rgb) { /* TODO */ });
	/* HSV -> */
	color = new Color("HSV", [0, 0, 0]);
	color.convert("RGB", function (hsv) {
		var h, s, v, chroma, mH, mI, rgb, vmc;
		h = Math.abs(hsv[0]) % 360;
		s = (hsv[1] < 0 ? Math.abs(hsv[1]) % 1 : (hsv[1] > 1 ? hsv[1] % 1 : hsv[1]));
		v = (hsv[2] < 0 ? Math.abs(hsv[2]) % 1 : (hsv[2] > 1 ? hsv[2] % 1 : hsv[2]));
		chroma = v * s;
		mH = h / 60;
		mI = chroma * (1 - (Math.abs((mH % 2) - 1)));
		vmc = v - chroma;
		if (0 <= mH) {
			if (mH < 1) {
				rgb = [ chroma, mI, 0 ];
			} else if (mH < 2) {
				rgb = [ mI, chroma, 0 ];
			} else if (mH < 3) {
				rgb = [ 0, chroma, mI ];
			} else if (mH < 4) {
				rgb = [ 0, mI, chroma ];
			} else if (mH < 5) {
				rgb = [ mI, 0, chroma ];
			} else if (mH < 6) {
				rgb = [ chroma, 0, mI ];
			}
		}
		return new Color((rgb[0] + vmc) * 255, (rgb[1] + vmc) * 255, (rgb[2] + vmc) * 255).color();
	});
	color.convert("HSV", function (hsv) { return hsv; });
	color.convert("HSL", function (hsv) { /* TODO */ });
	color.convert("YUV", function (hsv) { /* TODO */ });
	color.convert("LAB", function (hsv) { /* TODO */ });
	/* HSL -> */
	color = new Color("HSL", [0, 0, 0]);
	color.convert("RGB", function (hsl) { /* TODO */ });
	color.convert("HSV", function (hsl) { /* TODO */ });
	color.convert("HSL", function (hsl) { return hsl; });
	color.convert("YUV", function (hsl) { /* TODO */ });
	color.convert("LAB", function (hsl) { /* TODO */ });
	/* YUV -> */
	color = new Color("YUV", [0, 0, 0]);
	color.convert("RGB", function (yuv) {
		var y = yuv[0], u = yuv[1], v = yuv[2];
		return new Color("RGB", [ (y + 1.13983 * v), (y + -0.39465 * u + -0.58060 * v), (y + 2.03211 * u) ]).color();
	});
	color.convert("HSV", function (yuv) { /* TODO */ });
	color.convert("HSL", function (yuv) { /* TODO */ });
	color.convert("YUV", function (yuv) { return yuv; });
	color.convert("LAB", function (yuv) { /* TODO */ });
	/* LAB -> */
	color = new Color("LAB", [0, 0, 0]);
	color.convert("RGB", function (lab) { /* TODO */ });
	color.convert("HSV", function (lab) { /* TODO */ });
	color.convert("HSL", function (lab) { /* TODO */ });
	color.convert("YUV", function (lab) { /* TODO */ });
	color.convert("LAB", function (lab) { return lab; });
}(scope));
(function setup(scope) {
	"use strict";
	/*globals Color*/
	var Color = scope.Color, rgb, hsv;
	// RGB settings
	rgb = new Color("RGB", [0, 0, 0]);
	rgb.settings("minimum", [0, 0, 0]);
	rgb.settings("maximum", [255, 255, 255]);
	rgb.settings("names", [ "Red", "Green", "Blue" ]);
	rgb.settings("precision", [1, 1, 1]);
	rgb.settings("outOfRange", [ "clip", "clip", "clip" ]);
	// HSV settings
	hsv = new Color("HSV", [0, 0, 0]);
	hsv.settings("minimum", [0, 0, 0]);
	hsv.settings("maximum", [360, 1, 1]);
	hsv.settings("names", [ "Hue", "Saturation", "Value" ]);
	hsv.settings("precision", [10, 0.01, 0.01]);
	hsv.settings("outOfRange", [ "wrap", "clip", "clip" ]);
	// ...
}(scope));
(function colorSlider(scope) {
	"use strict";
	/*globals window*/
	var Color = scope.Color;
	Color.prototype.slider = function (parent) {
		var color = this, val = this.color(), names = this.settings("names"), i, len, sliders = [], container;
		parent = parent || document.getElementById("API-Interface");
		container = document.createElement('div');
		container.className = 'colorpicker';
		parent.appendChild(container);
		function getOffset(element) {
			var x = 0, y = 0;
			while (element && !isNaN(element.offsetTop) && !isNaN(element.offsetLeft)) {
				x += element.offsetLeft - element.scrollLeft;
				y += element.offsetTop - element.scrollTop;
				element = element.offsetParent;
			}
			return [ x, y ];
		}
		function Slider(settings) {
			var sliderrow, sliderhead, sliderslide, slideractive, sliderval;
			settings = settings || {};
			this.index = settings.index || 0;
			sliderrow = document.createElement('div');
			sliderhead = document.createElement('div');
			sliderslide = document.createElement('div');
			slideractive = document.createElement('div');
			sliderval = document.createElement('div');
			// classes
			sliderhead.className = 'header';
			sliderslide.className = 'slidebar';
			slideractive.className = 'slider';
			sliderval.className = 'number';
			// styles
			this.width = this.width(275);
			sliderslide.style.width = this.width() + "px";
			// text
			sliderhead.appendChild(document.createTextNode(names[i]));
			// append children
			sliderrow.appendChild(sliderhead);
			sliderrow.appendChild(sliderslide);
			sliderslide.appendChild(slideractive);
			sliderrow.appendChild(sliderval);
			container.appendChild(sliderrow);
			// events
			this.slider = sliderslide;
			this.slideractive = slideractive;
			this.value = sliderval;
			this.set(color.color());
			sliderslide.addEventListener("mousedown", this.push(color));
		}
		Slider.prototype.width = function (width) {
			width = width || 275;
			return function setWidth(set) {
				if (set === undefined) { return width; }
				width = set;
			};
		};
		Slider.prototype.set = function (c) {
			var slider = this, colors = c, max = color.settings("maximum"), min = color.settings("minimum");
			color.color(c);
			this.slideractive.style.left = Math.round((colors[slider.index] - min[slider.index]) / (max[slider.index] - min[slider.index]) * slider.width() - (slider.slideractive.offsetWidth / 2)) + "px";
			// remove all the children and then add the value
			while (this.value.firstChild) { this.value.removeChild(this.value.firstChild); }
			this.value.appendChild(document.createTextNode(c[this.index]));
		};
		Slider.prototype.push = function (color) {
			var slider = this;
			return function (e) {
				var colors = color.color();
				function onMouseMove(e) {
					colors[slider.index] = color.settings("minimum")[slider.index] + ((e.clientX - getOffset(slider.slider)[0]) / slider.width() * (color.settings("maximum")[slider.index] - color.settings("minimum")[slider.index]));
					slider.set(colors);
				}
				function onMouseUp() {
					window.removeEventListener("mousemove", onMouseMove);
					window.removeEventListener("mouseup", onMouseUp);
				}
				window.addEventListener("mousemove", onMouseMove);
				window.addEventListener("mouseup", onMouseUp);
				onMouseMove(e);
			};
		};
		for (i = 0, len = val.length; i < len; i += 1) {
			sliders[i] = new Slider({ index: i });
		}
		return sliders;
	};
}(scope));
