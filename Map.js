(function map(scope) {
	"use strict";
	/* Factory - Reference methods here */
	function Factory() {}
	Factory.Instances = function Instances() {};
	Factory.Instances.prototype.length = Array.prototype.length || 0;
	Factory.Instances.prototype.push = Array.prototype.push;
	Factory.Instances.prototype.slice = Array.prototype.slice;
	Factory.Instances.prototype.splice = Array.prototype.splice;
	Factory.create = function create(owner) {
		var instance = new this();
		this.instances.push(instance);
		if (owner) { instance.owner = owner; }
		if (typeof this.init === 'function') { this.init(); }
		if (typeof instance.init === 'function') { instance.init(); }
		return instance;
	};
	Factory.prototype.extend = function (name, value) {
		var proto, prop;
		if (name === undefined) { throw new Error("name is undefined."); }
		if (typeof name === 'object') {
			proto = name;
			for (prop in proto) {
				if (proto.hasOwnProperty(prop)) {
					this[prop] = proto[prop];
				}
			}
			return this;
		}
		if (typeof name === 'string' && value !== undefined) {
			this[name] = value;
			return this;
		}
		throw new Error(".extend error: name " + name + " value " + value);
	};
	function MapEvent() { this.listeners = {}; }
	MapEvent.prototype.constructor = MapEvent;
	MapEvent.prototype.listen = function listen(type, func) {
		if (type === undefined) { throw new Error("type is undefined."); }
		if (typeof type !== 'string') { throw new Error("type is not a string."); }
		if (this.listeners[type] === undefined) { this.listeners[type] = []; }
		this.listeners[type].push(func);
		return this;
	};
	MapEvent.prototype.fire = function fire(e) {
		var i, len, listeners;
		if (!e) { throw new Error("Event e is invalid."); }
		if (typeof e === 'string') { e = { type: e }; }
		if (!e.target) { e.target = this; }
		if (this.listeners[e.type] !== undefined) {
			listeners = this.listeners[e.type];
			for (i = 0, len = listeners.length; i < len; i += 1) {
				listeners[i].call(this, e);
			}
		}
		return this;
	};
	MapEvent.prototype.unlisten = function unlisten(type, func) {
		var listeners, i, len;
		if (this.listeners[type] !== undefined) {
			listeners = this.listeners[type];
			for (i = 0, len = listeners.length; i < len; i += 1) {
				if (listeners[i] === func) {
					listeners.splice(i, 1);
					return this;
				}
			}
		}
		return this;
	};
	function Map() {}
	function MapPoint() {}
	MapPoint.prototype.constructor = MapPoint;
	MapPoint.prototype.posx = MapPoint.prototype.posy = MapPoint.prototype.posz = 0;
	MapPoint.create = Factory.create;
	MapPoint.instances = new Factory.Instances();
	MapPoint.prototype.position = function (pos) {
		// if static, don't do anything
		if (this.type === 'static') { return this; }
		// if not static, reposition the map element
		this.element.style.left = pos[0] + "px";
		this.element.style.top = pos[1] + "px";
		return this;
	};
	Map.prototype.Point = MapPoint;
	Map.prototype.constructor = Map;
	Map.instances = new Factory.Instances();
	Map.create = Factory.create;
	Map.prototype.extend = Factory.prototype.extend;
	Map.prototype.Element = MapPoint;
	Map.prototype.init = function init() {
		var that = this;
		that.element = document.createElement('div');
		that.element.style.width = '300px';
		that.element.style.height = '300px';
		that.element.style.border = '1px solid #000';
		that.element.style.position = 'relative';
		that.element.addEventListener('click', function clickEvent() {
			this.focus();
			that.tabindex = 0;
		});
		return that;
	};
	Map.prototype.crosshairs = function () {
		MapPoint.create(this).type('static').tabIndex('-1').css({ borderBottom: "0.1em dotted grey", height: "50%", position: "absolute", width: "100%" });
		MapPoint.create(this).type('static').tabIndex('-1').css({ borderRight: "0.1em dotted grey", height: "100%", position: "absolute", width: "50%" });
	};
	Map.prototype.parent = function (parent) {
		parent.appendChild(this.element);
		return this;
	};
	Map.prototype.image = function (src) {
		this.element.style.backgroundImage = "url('" + src + "')";
		return this;
	};
	Map.prototype.posx = 0;
	Map.prototype.posy = 0;
	Map.prototype.posz = 0;
	Map.prototype.update = function updateMap() {
		var i, len;
		if (this.images[this.posz] === undefined) { throw new Error('Map coordinates out of range (z: ' + this.posz + ')'); }
		this.element.style.backgroundPosition = [ this.posx, 'px', ' ', this.posy, 'px' ].join('');
		this.element.style.backgroundImage = 'url("' + this.images[this.posz] + '")';
		for (i = 0, len = this.Element.instances.length; i < len; i += 1) {
			this.Element.instances[i].position(this.posx, this.posy);
		}
		return this;
	};
	Map.prototype.position = function (input) {
		var xyz, x, y, z;
		if (!(typeof input === 'object' && input.length)) { xyz = arguments; } else { xyz = input; }
		x = xyz[0];
		y = xyz[1];
		z = xyz[2];
		if (x === undefined) {
			x = this.posx;
			y = this.posy;
			z = this.posz;
			return [x, y, z];
		}
		this.posx = x;
		this.posy = y;
		this.posz = z;
		this.update();
		this.event.fire('changePosition');
	};
	Map.prototype.event = new MapEvent();
	Map.prototype.moveIncremental = function (dest, time, interval) {
		var i = 0, occ, diff, pos = this.position(), that = this, timer;
		if (!(typeof dest === 'object' && dest.length === 3)) { return false; }
		if (typeof time !== 'number') { return false; }
		if (typeof interval !== 'number') { interval = 100; }
		diff = [ ((dest[0] - pos[0]) / time) * interval, ((dest[1] - pos[1]) / time) * interval, ((dest[2] - pos[2]) / time) * interval ];
		occ = time / interval;
		function performAnimation() {
			that.position(Math.round(pos[0] + diff[0] * i), Math.round(pos[1] + diff[1] * i), Math.round(pos[2] + diff[2] * i));
			i += 1;
			if (i > occ) { window.clearInterval(timer); }
		}
		timer = window.setInterval(performAnimation, interval);
		return this;
	};
	Map.prototype.image = function setImage(z, img) {
		var im;
		if (img !== undefined) {
			if (typeof this.images !== 'object') { this.images = {}; }
			this.images[z] = img;
			if (this.autoload) {
				im = new Image();
				im.src = img;
			}
		}
		return this;
	};
	Map.prototype.moveFunc = function (func, limit, interval) {
		var timer, that = this;
		function perform() {
			that.position(func(that.position()));
			if (timer >= limit) { window.clearInterval(timer); }
		}
		timer = window.setInterval(perform, interval);
		return this;
	};
	Map.prototype.children = [];
	Map.prototype.shift = function (x, y, z) {
		if (x === undefined) { throw new Error('coordinate offsets are undefined (Map.shift).'); }
		if (y === undefined && z === undefined) { y = z = x; }
		this.position(this.posx + (x || 0), this.posy + (y || 0), this.posz + (z || 0));
		return this;
	};
	Map.prototype.amplify = function (x, y, z) {
		if (x === undefined) { throw new Error('coordinate offsets are undefined (Map.shift).'); }
		if (y === undefined && z === undefined) { y = z = x; }
		this.position(this.posx * (x || 1), this.posy * (y || 1), this.posz * (z || 1));
		return this;
	};
	Map.prototype.point = function point(pos) {
		return MapPoint.create(this).position(pos);
	};
	MapPoint.type = function (subject) {
		var type = typeof subject, regex;
		if (type === 'object') {
			if (subject.length !== undefined) { return 'array'; }
			if (subject.nodeType === 1) { return 'element'; }
			if (subject.nodeType === 3) { return 'text'; }
			return 'object';
		}
		if (type === 'string') {
			if (subject === '') { return 'empty'; }
			// RegExr  http://regexr.com?33lsd
			regex = /^(http:\/\/|https:\/\/)?([\-a-zA-Z0-9@:%_\+.~#?&=]{2,256}\.[a-z]{2,4})\b(\/[\-a-zA-Z0-9@:%_\+.~#&\/=]*)?\b(\?[\-a-zA-Z0-9.~_=]*)?$/;
			if (regex.test(subject)) { return 'url'; }
			return type;
		}
		if (type === 'number') {
			if (isNaN(subject)) { return 'NaN'; }
			if (!isFinite(subject)) { return 'infinity'; }
			if (subject % 1 !== 0) { return 'float'; }
			return 'integer';
		}
		if (subject === null) { return 'null'; }
		if (subject === undefined) { return 'undefined'; }
		return type;
	};
	MapPoint.prototype.element = null;
	MapPoint.prototype.changeMapPointPositions = function (e) {
		var relativePosition, subject, i, len;
		if (typeof e !== 'object') { throw new Error("changeMapPointPositions expects an object argument."); }
		if (e.position === undefined && !e.length) { throw new Error("invalid argument for changeMapPositions"); }
		relativePosition = e.position !== undefined ? e.position : e;
		subject = this.constructor.instances;
		for (i = 0, len = subject.length; i < len; i += 1) {
			subject[i].element.style.left = +subject[i].element.style.left.replace('px') + e.position[0];
			subject[i].element.style.top = +subject[i].element.style.left.replace('px') + e.position[1];
		}
		return this;
	};
	MapPoint.prototype.init = function init() {
		var that = this;
		that.element = document.createElement('div');
		that.element.tabIndex = "1";
		if (that.owner) {
			that.owner.element.appendChild(that.element);
			that.owner.event.listen('changeposition', this.changeMapPointPositions);
			that.owner.children.push(that);
			that.index = that.owner.children.indexOf(that);
			that.element.addEventListener('click', function clickEvent() {
				that.focus = true;
				that.owner.focus = that.index;
				that.owner.event.fire('changeMapPointFocus');
				return that;
			});
		}
		return that;
	};
	MapPoint.prototype.tabIndex = function (index) {
		this.element.tabIndex = index;
		return this;
	};
	MapPoint.prototype.type = function (type) {
		if (type === 'static') { this.type = 'static'; }
		return this;
	};
	MapPoint.prototype.text = function (txt) {
		if (!this.element) {
			this.element = document.createElement('div');
		}
		while (this.element.firstChild) { this.element.removeChild(this.element.firstChild); }
		this.element.appendChild(document.createTextNode(txt));
		return this;
	};
	MapPoint.prototype.alt = function (desc) {
		if (!this.element) { this.element = document.createElement('div'); }
		//while (this.element.firstChild) { this.element.removeChild(this.element.firstChild); }
		if (this.element.tagName === 'IMG') { this.element.alt = desc; }
		if (this.element.tagName === 'DIV') { this.element.title = desc; }
		return this;
	};
	MapPoint.prototype.image = function (xyz, filename) {
		var i, len, img;
		this.files = this.files || [];
		if ((typeof filename !== 'string' || typeof xyz !== 'number') && typeof xyz !== 'object' && typeof xyz !== 'number') { throw new Error('Invalid arguments to MapPoint.image'); }
		if (typeof filename === 'string' && typeof xyz === 'number') {
			this.files[xyz] = filename;
			if (this.autoload) {
				img = new Image();
				img.src = filename;
			}
			return this;
		}
		if (xyz === 'object' && xyz.length !== undefined) {
			for (i = 0, len = xyz.length; i < len; i += 1) {
				this.files[i] = xyz[i];
			}
			return this;
		}
		throw new Error("unknown error.");
	};
	MapPoint.prototype.parent = function (parent) {
		if (!this.element) { this.element = document.createElement('div'); }
		parent.appendChild(this.element);
		return this;
	};
	MapPoint.prototype.css = function (css) {
		var prop;
		if (!this.element) { this.element = document.createElement('div'); }
		for (prop in css) {
			if (css.hasOwnProperty(prop)) {
				this.element.style[prop] = css[prop];
			}
		}
		return this;
	};
	MapPoint.prototype.extend = Factory.prototype.extend;
	scope.Map = Map;
}(window));
