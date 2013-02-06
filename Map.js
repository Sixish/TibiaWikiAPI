(function (scope) {
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
		this.prototype.owner = owner;
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
	};
	function Map() {}
	function MapElement() {
		var types = [], i, len;
		for (i = 0, len = arguments.length; i < len; i += 1) {
			types[i] = MapElement.type(arguments[i]);
		}
	}
	Map.prototype.constructor = Map;
	Map.instances = new Factory.Instances();
	Map.create = Factory.create;
	Map.prototype.extend = Factory.prototype.extend;
	Map.prototype.Element = MapElement;
	Map.prototype.textOverride = null;
	Map.prototype.init = function () {
		this.element = document.createElement('div');
		this.element.style.width = '300px';
		this.element.style.height = '300px';
		this.element.style.border = '1px solid #000';
		this.element.style.position = 'relative';
	};
	Map.prototype.crosshairs = function (offset) {
		MapElement.create(this).type('static').css({ borderBottom: "0.1em dotted grey", height: "50%", position: "absolute", width: "100%" });
		MapElement.create(this).type('static').css({ borderRight: "0.1em dotted grey", height: "100%", position: "absolute", width: "50%" });
	};
	Map.prototype.parent = function (parent) {
		parent.appendChild(this.element);
		return this;
	};
	Map.prototype.image = function (src) {
		this.element.style.backgroundImage = "url('" + src + "')";
		return this;
	};
	Map.prototype.position = function (x, y, z) {
		var pos;
		if (x === undefined) {
			pos = this.element.style.backgroundPosition.replace(/px/g, "").split(" ");
			x = +pos[0] || 0;
			y = +pos[1] || 0;
			return [x, y];
		}
		this.element.style.backgroundPosition = x + "px" + " " + y + "px";
		this.event.fire('changePosition');
	};
	Map.prototype.event = new MapEvent();
	Map.prototype.moveIncremental = function (dest, time, interval) {
		var i = 0, occ, diff, pos = this.position(), that = this, timer;
		if (!(typeof dest === 'object' && dest.length === 2)) { return false; }
		if (typeof time !== 'number') { return false; }
		if (typeof interval !== 'number') { interval = 100; }
		diff = [ ((dest[0] - pos[0]) / time) * interval, ((dest[1] - pos[1]) / time) * interval ];
		occ = time / interval;
		function performAnimation() {
			that.position(Math.round(pos[0] + diff[0] * i), Math.round(pos[1] + diff[1] * i));
			i += 1;
			if (i > occ) { window.clearInterval(timer); }
		}
		timer = window.setInterval(performAnimation, interval);
		return this;
	};
	MapElement.type = function (subject) {
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
	MapElement.prototype.constructor = MapElement;
	MapElement.prototype.element = function () {
		if (!this.element) { this.element = document.createElement('div'); }
		return this;
	};
	MapElement.prototype.changeMapElementPositions = function (e) {
		var relativePosition, subject, i, len;
		if (typeof e !== 'object') { throw new Error("changeMapElementPositions expects an object argument."); }
		if (e.position === undefined && !e.length) { throw new Error("invalid argument for changeMapPositions"); }
		relativePosition = e.position !== undefined ? e.position : e;
		subject = this.constructor.instances;
		for (i = 0, len = subject.length; i < len; i += 1) {
			subject[i].element.style.left = +subject[i].element.style.left.replace('px') + e.position[0];
			subject[i].element.style.top = +subject[i].element.style.left.replace('px') + e.position[1];
		}
		return this;
	};
	MapElement.prototype.init = function () {
		this.element = document.createElement('div');
		this.owner.element.appendChild(this.element);
		this.owner.event.listen('changeposition', this.changeMapElementPositions);
		return this;
	};
	MapElement.prototype.position = function (pos) {
		this.element.style.left = pos[0];
		this.element.style.top = pos[1];
		return this;
	};
	MapElement.prototype.type = function (type) {
		if (type === 'static') { this.type = 'static'; }
		return this;
	};
	MapElement.prototype.text = function (txt) {
		if (!this.element) {
			this.element = document.createElement('div');
		}
		while (this.element.firstChild) { this.element.removeChild(this.element.firstChild); }
		this.element.appendChild(document.createTextNode(txt));
		return this;
	};
	MapElement.prototype.alt = function (desc) {
		if (!this.element) { this.element = document.createElement('div'); }
		//while (this.element.firstChild) { this.element.removeChild(this.element.firstChild); }
		if (this.element.tagName === 'IMG') { this.element.alt = desc; }
		if (this.element.tagName === 'DIV') { this.element.title = desc; }
		return this;
	};
	MapElement.prototype.image = function (filename) {
		if (!this.element) { this.element = document.createElement('div'); }
		this.element.style.backgroundImage = "url(" + filename + ")";
		return this;
	};
	MapElement.prototype.parent = function (parent) {
		if (!this.element) { this.element = document.createElement('div'); }
		parent.appendChild(this.element);
		return this;
	};
	MapElement.prototype.css = function (css) {
		var prop;
		if (!this.element) { this.element = document.createElement('div'); }
		for (prop in css) {
			if (css.hasOwnProperty(prop)) {
				this.element.style[prop] = css[prop];
			}
		}
		return this;
	};
	MapElement.instances = new Factory.Instances();
	MapElement.create = Factory.create;
	MapElement.prototype.extend = Factory.prototype.extend;
	MapElement.prototype.extend({ "element": null, pos: [0, 0, 0] });
	scope.Map = Map;
}(window));
