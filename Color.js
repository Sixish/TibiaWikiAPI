(function (scope) {
	"use strict";
	/*jslint browser: true*/
	var Math = window.Math;
	// math functions
	function wrap(val, min, max) {
		var interval;
		max = max + 1;
		interval = max - min;
		return min + (val % interval);
	}
	function clip(val, min, max) {
		return val > max ? max : val < min ? min : val;
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
				if (oor === 'clip') { color[i] = clip(color[i], min[i], max[i]); }
				if (oor === 'wrap') { color[i] = wrap(color[i], min[i], max[i]); }
			}
		}
		return color;
	};
	Color.prototype.color = function (color) {
		color = this.validate(color) || [0, 0, 0];
		return function setColor(model, channels) {
			var type;
			if (typeof model === 'object' && model.length) {
				channels = model;
				model = this.model();
			}
			if (model === undefined) { return color; }
			if (channels === undefined) { return this.convert(model); }
			type = typeof channels;
			if (type === 'object') { color = channels; }
			if (type === 'number') {
				/*jslint bitwise: true*/
				channels = [
					channels >> 16 & 0xFF,
					(channels - ((channels >> 16) << 16) >> 8) & 0xFF,
					(channels - ((channels >> 8) << 8)) & 0xFF
				];
				/*jslint bitwise: false*/
				color = channels;
				this.model("RGB");
				return this;
			}
			this.model(model);
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
		function Hook() { this.hooks = []; }
		Hook.prototype.fire = function () {
			var i, len = this.hooks.length;
			for (i = 0; i < len; i += 1) {
				if (!this.hooks[i].apply(this, arguments)) {
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
				if (hooks[hook] === undefined && func === undefined) {
					throw new Error("Cannot create hook without a function.");
				}
				if (hooks[hook] === undefined) {
					hooks[hook] = new Hook();
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
}(window));
(function convert(window) {
	"use strict";
	/*globals Color*/
	var Color = window.Color, color;
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
}(window));
(function setup(window) {
	"use strict";
	/*globals Color*/
	var Color = window.Color, rgb, hsv;
	// RGB settings
	rgb = new Color("RGB", [0, 0, 0]);
	rgb.settings("minimum", [0, 0, 0]);
	rgb.settings("maximum", [255, 255, 255]);
	rgb.settings("precision", [1, 1, 1]);
	rgb.settings("outOfRange", "clip");
	// HSV settings
	hsv = new Color("HSV", [0, 0, 0]);
	hsv.settings("mimimum", [0, 0, 0]);
	hsv.settings("maximum", [360, 1, 1]);
	hsv.settings("precision", [1, 0.001, 0.001]);
	hsv.settings("outOfRange", "wrap");
	// ...
}(window));
