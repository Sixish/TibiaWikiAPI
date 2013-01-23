(function (scope) {
	"use strict";
	/*jslint browser: true*/
	var Color, Math = window.Math;
	Color = (function color() {
		return function Color(model, color) {
			if (typeof model === 'object' && model.length) {
				color = model;
				model = "RGB";
			}
			// setup
			this.model = this.model(model);
			this.color = this.color(color);
			this.hook = this.hook();
		};
	}());
	/*jslint bitwise: true*/
	Color.prototype.valueOf = function () {
		var rgb = this.convert("RGB", this.color());
		return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
	};
	/*jslint bitwise: false*/
	Color.prototype.color = function (color) {
		color = color || [0, 0, 0];
		return function setColor(set) {
			var type, i, len, max, min, ret;
			if (set === undefined) { return color; }
			type = typeof set;
			if (type === 'number') {
				/*jslint bitwise: true*/
				set = [
					set >> 16 & 0xFF,
					(set - ((set >> 16) << 16) >> 8) & 0xFF,
					(set - ((set >> 8) << 8)) & 0xFF
				];
				/*jslint bitwise: false*/
				color = set;
				this.model("RGB");
				return this;
			}
			if (type === 'string') {
				color = this.convert(set);
				this.model(set);
				return this;
			}
			if (type === 'object' && set.length) {
				ret = [];
				max = this.settings("maximum");
				min = this.settings("minimum");
				for (i = 0, len = set.length; i < len; i += 1) {
					if (set[i] > max[i]) { ret[i] = this.colorOutOfRange(set[i]); }
					if (set[i] < min[i]) { ret[i] = this.colorOutOfRange(set[i]); }
					ret[i] = set[i];
				}
				color = ret;
				return this;
			}
		};
	};
	Color.prototype.model = function (model) {
		model = model || "RGB";
		return function setModel(set) {
			if (set === undefined) {
				return model;
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
	Color.prototype.convert = function convert(model) {
		var cvt = { RGB: {}, HSV: {}, HSL: {}, YUV: {}, LAB: {}, HEX: {} };
		function max() {
			var i = 0, len = arguments.length, maximum;
			for (i; i < len; i += 1) {
				if (maximum === undefined || arguments[i] > maximum) {
					maximum = arguments[i];
				}
			}
			return maximum;
		}
		function min() {
			var i = 0, len = arguments.length, minimum;
			for (i; i < len; i += 1) {
				if (minimum === undefined || arguments[i] < minimum) {
					minimum = arguments[i];
				}
			}
			return minimum;
		}
		function clip(val, min, max) {
			var ret = val;
			if (val < min) {
				ret = min;
			} else if (val > max) {
				ret = max;
			}
			return ret;
		}
		/* RGB -> */
		cvt.RGB.RGB = function (rgb) { return rgb; };
		cvt.RGB.HSV = function (rgb) {
			var rgb_min, rgb_max, r = rgb[0], g = rgb[1], b = rgb[2], h, s, v;
			rgb_min = min(r, g, b);
			rgb_max = max(r, g, b);
			v = rgb_max / 255;
			if (v === 0) {
				h = s = 0;
				return [ h, s, v ];
			}
			r = r / (v * 255);
			g = g / (v * 255);
			b = b / (v * 255);
			rgb_min = min(r, g, b);
			rgb_max = max(r, g, b);
			s = rgb_max - rgb_min;
			if (s === 0) {
				h = 0;
				return [ h, s, v ];
			}
			r = (r - rgb_min) / s;
			g = (g - rgb_min) / s;
			b = (b - rgb_min) / s;
			rgb_min = min(r, g, b);
			rgb_max = max(r, g, b);
			h = (360 + (rgb_max === r ? 60 * (g - b) : (rgb_max === g ? 120 + 60 * (b - r) : (240 + 60 * (r - g))))) % 360;
			return [ h, s, v ];
		};
		cvt.RGB.HSL = function (rgb) { /* TODO */ };
		cvt.RGB.YUV = function (rgb) {
			var r = rgb[0], g = rgb[1], b = rgb[2];
			return [
				clip(Math.round(0.299 * r + 0.587 * g + 0.114 * b), 0, 255),
				clip(Math.round(-0.14713 * r + -0.28886 * g + 0.436 * b), 0, 255),
				clip(Math.round(0.615 * r + -0.51499 * g + -0.10001 * b), 0, 255)
			];
		};
		cvt.RGB.LAB = function (rgb) { /* TODO */ };
		/* HSV -> */
		cvt.HSV.RGB = function (hsv) {
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
			return [
				Math.round((rgb[0] + vmc) * 255),
				Math.round((rgb[1] + vmc) * 255),
				Math.round((rgb[2] + vmc) * 255)
			];
		};
		cvt.HSV.HSV = function (hsv) { return hsv; };
		cvt.HSV.HSL = function (hsv) { /* TODO */ };
		cvt.HSV.YUV = function (hsv) { /* TODO */ };
		cvt.HSV.LAB = function (hsv) { /* TODO */ };
		/* HSL -> */
		cvt.HSL.RGB = function (hsl) { /* TODO */ };
		cvt.HSL.HSV = function (hsl) { /* TODO */ };
		cvt.HSL.HSL = function (hsl) { return hsl; };
		cvt.HSL.YUV = function (hsl) { /* TODO */ };
		cvt.HSL.LAB = function (hsl) { /* TODO */ };
		/* YUV -> */
		cvt.YUV.RGB = function (yuv) {
			var y = yuv[0], u = yuv[1], v = yuv[2];
			return [
				clip(Math.round(y + 1.13983 * v), 0, 255),
				clip(Math.round(y + -0.39465 * u + -0.58060 * v), 0, 255),
				clip(Math.round(y + 2.03211 * u), 0, 255)
			];
		};
		cvt.YUV.HSV = function (yuv) { /* TODO */ };
		cvt.YUV.HSL = function (yuv) { /* TODO */ };
		cvt.YUV.YUV = function (yuv) { return yuv; };
		cvt.YUV.LAB = function (yuv) { /* TODO */ };
		/* LAB -> */
		cvt.LAB.RGB = function (lab) { /* TODO */ };
		cvt.LAB.HSV = function (lab) { /* TODO */ };
		cvt.LAB.HSL = function (lab) { /* TODO */ };
		cvt.LAB.YUV = function (lab) { /* TODO */ };
		cvt.LAB.LAB = function (lab) { return lab; };
		return cvt[this.model()][model](this.color());
	};
	Color.prototype.shift = function (increase) {
		var i, len, shiftBy, color = this.color();
		shiftBy = arguments.length > 1 ? arguments : increase || 0;
		for (i = 0, len = color.length; i < len; i += 1) {
			color[i] += typeof shiftBy === 'object' ? shiftBy[i] : shiftBy;
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
		return new Color(this.model(), new Color("RGB", [ ret, ret, ret ]).convert(this.model())).color;
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
