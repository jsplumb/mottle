/*
	Wraps touch events and presents them as mouse events: you register for standard mouse events such as 
	click, mousedown, mouseup and mousemove, and the touch adapter will automatically register corresponding
	touch events for each of these.  'click' and 'dblclick' are achieved through setting a timer on touchstart and
	firing an event on touchend if the timer has not yet expired. The delay for this timer can be set on 
	the Mottle's constructor (clickThreshold); the default is 150ms.

	Mottle has no external dependencies.
*/
;(function() {

	var ms = typeof HTMLElement != "undefined" ? (HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.oMatchesSelector || HTMLElement.prototype.msMatchesSelector) : null;
	var matchesSelector = function(el, selector, ctx) {
		if (ms) {
			return ms.apply(el, [ selector, ctx ]);
		} 

		ctx = ctx || el.parentNode;
		var possibles = ctx.querySelectorAll(selector);
		for (var i = 0; i < possibles.length; i++) {
			if (possibles[i] === el) {
				return true;
			}
		}
		return false;
	};
	
	var _curryChildFilter = function(children, obj, fn) {
		if (children == null) return fn;
		else {
			var c = children.split(",");
			return function(e) {
				this.__tauid = fn.__tauid;
				var t = e.srcElement || e.target;
				for (var i = 0; i < c.length; i++) {
					if (matchesSelector(t, c[i], obj)) {
						fn.apply(t, arguments);
					}
				}
			};
		}
	};
	
	var DefaultHandler = function(obj, evt, fn, _store, _unstore, children) {
		_store(obj, evt, fn);
		_bind(obj, evt, _curryChildFilter(children, obj, fn));
	};
	
	var SmartClickHandler = function(obj, evt, fn, _store, _unstore, children) {
		var down = function(e) {
				this.__taGenerated = true;
				obj.__tad = _pageLocation(e);
				return true;
			},
			up = function(e) {
				this.__taGenerated = true;
				obj.__tau = _pageLocation(e);
				return true;
			},
			click = function(e) {
				this.__taGenerated = true;
				if (obj.__tad && obj.__tau && obj.__tad[0] == obj.__tau[0] && obj.__tad[1] == obj.__tau[1]) {
					fn.apply((e.srcElement || e.target), [ e ]);
				}
			};
			
		// TODO TOUCH
		DefaultHandler(obj, "mousedown", down, _store, _unstore, children);
		DefaultHandler(obj, "mouseup", up, _store, _unstore, children);
		DefaultHandler(obj, "click", click, _store, _unstore, children);
		
		_store(obj, evt, fn);
		
		// TODO ensure they are not unbound by a general "unbind mousedown or mouseup" call.
		
		fn.__taUnstore = function() {
			_unbind(obj, "mousedown", down);
			_unstore(obj, "mousedown", down, true);
			_unbind(obj, "mouseup", up);
			_unstore(obj, "mouseup", up, true);
			_unbind(obj, "click", click);
			_unstore(obj, "click", click, true);
		};
	};
	
	var TouchEventHandler = function(obj, fn, _store) {
		
	};
	
	var meeHelper = function(type, evt, obj, target) {
		for (var i in obj.__tamee[type]) {
			obj.__tamee[type][i].apply(target, [ evt ]);
		}
	};
	var MouseEnterExitHandler = function(obj, evt, fn, _store, _unstore, children) {
		if (!obj.__tamee) {
			// __tamee holds a flag saying whether the mouse is currently "in" the element, and a list of
			// both mouseenter and mouseexit functions.
			obj.__tamee = {
				over:false,
				mouseenter:{},
				mouseexit:{}
			};
			// now register over and out functions (one time only)
			var over = function(e) {
				this.__taGenerated = true;
				var t = e.srcElement || e.target;
				// we have the event target. were children defined?
				if (t !== obj && obj.__tamee.over) {
					t.__tamee = t._tamee || {};
					t.__tamee.over = false;
					obj.__tamee.over = false;
					meeHelper("mouseexit", e, obj, t);
				}
				else if (!obj.__tamee.over) {
					t.__tamee = t._tamee || {};
					t.__tamee.over = true;
					obj.__tamee.over = true;
					meeHelper("mouseenter", e, obj, t);
				}
			};
			
			_store(obj, "mouseover", over);
			_bind(obj, "mouseover", _curryChildFilter(children, obj, over));
			
			var out = function(e) {
				this.__taGenerated = true;
				var t = e.srcElement || e.target;
				if (t !== obj && obj.__tamee.over) {
					t.__tamee = t._tamee || {};
					t.__tamee.over = false;
					obj.__tamee.over = false;
					meeHelper("mouseexit", e, obj);
				}
			};
			_store(obj, "mouseout", out);
			_bind(obj, "mouseout", _curryChildFilter(children, obj, out));
		}
		
		fn.__taUnstore = function() {
			delete obj.__tamee[evt][fn.__tauid];
		};
		_store(obj, evt, fn);
		obj.__tamee[evt][fn.__tauid] = fn;
		
	};

	var isTouchDevice = "ontouchstart" in document.documentElement,
		isMouseDevice = "onmousedown" in document.documentElement,
		downEvent = isTouchDevice ? "touchstart" : "mousedown",
		upEvent = isTouchDevice ? "touchend" : "mouseup",
		moveEvent = isTouchDevice ? "touchmove" : "mousemove",
		touchMap = { "mousedown":"touchstart", "mouseup":"touchend", "mousemove":"touchmove" },
		click="click", dblclick="dblclick",contextmenu="contextmenu",
		touchstart="touchstart",touchend="touchend",touchmove="touchmove",
		ta_down = "__MottleDown", ta_up = "__MottleUp", 
		ta_context_down = "__MottleContextDown", ta_context_up = "__MottleContextUp",
		iev = (function() {
		        var rv = -1; 
		        if (navigator.appName == 'Microsoft Internet Explorer') {
		            var ua = navigator.userAgent,
		            	re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		            if (re.exec(ua) != null)
		                rv = parseFloat(RegExp.$1);
		        }
		        return rv;
		})(),
		isIELT9 = iev > -1 && iev < 9, 
		_pageLocation = function(e) {
			if (isIELT9) {
				return [ e.clientX + document.documentElement.scrollLeft, e.clientY + document.documentElement.scrollTop ];
			}
			else {
				var ts = _touches(e), t = _getTouch(ts, 0);
				// this is for iPad. may not fly for Android.
				return [t.pageX, t.pageY];
			}
		},
		// 
		// extracts the touch with the given index from the list of touches
		//
		_getTouch = function(touches, idx) { return touches.item ? touches.item(idx) : touches[idx]; },
		//
		// gets the touches from the given event, if they exist. otherwise sends the original event back.
		//
		_touches = function(e) { return e.touches || [ e ]; },
		_touchCount = function(e) { return _touches(e).length || 1; },
		//http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
		_bind = function( obj, type, fn ) {
			if (obj.addEventListener)
				obj.addEventListener( type, fn, false );
			else if (obj.attachEvent) {
				obj["e"+type+fn] = fn;
				obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
				obj.attachEvent( "on"+type, obj[type+fn] );
			}
		},
		_unbind = function( obj, type, fn ) {
			if (obj.removeEventListener)
				obj.removeEventListener( type, fn, false );
			else if (obj.detachEvent) {
				obj.detachEvent( "on"+type, obj[type+fn] );
				obj[type+fn] = null;
				obj["e"+type+fn] = null;
			}
		},
		_devNull = function() {};

	window.Mottle = function(params) {
		params = params || {};
		var self = this, 
			guid = 1,
			clickThreshold = params.clickThreshold || 150,
			dlbClickThreshold = params.dblClickThreshold || 250,
			_smartClicks = params.smartClicks,
			//
			// this function generates a guid for every handler, sets it on the handler, then adds
			// it to the associated object's map of handlers for the given event. this is what enables us 
			// to unbind all events of some type, or all events (the second of which can be requested by the user, 
			// but it also used by Mottle when an element is removed.)
			_store = function(obj, event, fn) {
				var g = guid++;
				obj.__ta = obj.__ta || {};
				obj.__ta[event] = obj.__ta[event] || {};
				// store each handler with a unique guid.
				obj.__ta[event][g] = fn;
				// set the guid on the handler.
				fn.__tauid = g;
				return g;
			},
			_unstore = function(obj, event, fn, forceRemove) {
				if (!fn.__taGenerated || forceRemove) {
					delete obj.__ta[event][fn.__tauid];
					// a handler might have attached an unstore function, to remove its helper stuff.
					fn.__taUnstore && fn.__taUnstore();
				}
			},
			// wrap bind function to provide "smart" click functionality, which prevents click events if
			// the mouse has moved between up and down.
			__bind = function(obj, evt, fn, children) {
				if (_smartClicks && (evt === "click" || evt === "dblclick"))
					SmartClickHandler(obj, evt, fn, _store, _unstore, children);
				else if (evt === "mouseenter" || evt == "mouseexit")
					MouseEnterExitHandler(obj, evt, fn, _store, _unstore, children);
				else 
					DefaultHandler(obj, evt, fn, _store, _unstore, children);
			},
			// TODO MOVE TO A HANDLER
			_addClickWrapper = function(obj, fn, touchCount, eventIds, supportDoubleClick) {
				var handler = { down:false, touches:0, originalEvent:null, lastClick:null, timeout:null };
				var down = function(e) {						
					var tc = _touchCount(e);					
					if (tc == touchCount) {				
						handler.originalEvent = e;	
						handler.touches = tc;										
						handler.down = true;							
						handler.timeout = window.setTimeout(function() {														
							handler.down = null;
						}, clickThreshold);
					}
				};
				fn[eventIds[0]] = down;
				__bind(obj, touchstart, down);	
				var up = function(e) {																		
					if (handler.down) {
						// if supporting double click, check if there is a timestamp for a recent click
						if (supportDoubleClick) {
							var t = new Date().getTime();
							if (handler.lastClick) {							
								if (t - handler.lastClick < dblClickThreshold)
									fn(handler.originalEvent);
							}

							handler.lastClick = t;
						}
						else
							fn(handler.originalEvent);
					}
					handler.down = null;
					window.clearTimeout(handler.timeout);
				};				
				fn[eventIds[1]] = up;	
				__bind(obj, touchend, up);
			};

		var _doBind = function(obj, evt, fn, children) {
			obj = typeof obj === "string" ? document.getElementById(obj) : obj;
			//
			// TODO: some devices are both and touch AND mouse. we shouldn't make the
			// two cases mutually exclusive. 
			// also, it would be nice to refactor this.
			if (isTouchDevice) {
				if (evt === click) {
					_addClickWrapper(obj, fn, 1, [ta_down, ta_up]);
				}
				else if (evt === dblclick) {
					_addClickWrapper(obj, fn, 1, [ta_down, ta_up], true);
				}
				else if (evt === contextmenu) {
					_addClickWrapper(obj, fn, 2, [ta_context_down, ta_context_up]);
				}
				else {
					__bind(obj, touchMap[evt], fn);
				}
			}
			else 
				__bind(obj, evt, fn, children);

			return self;
		};

		
		var _doUnbind = function(obj, evt, fn) {
			if (isTouchDevice) {
				if (evt === click) {					
					_unbind(obj, touchstart, fn[ta_down]);
					fn[ta_down] = null;
					_unbind(obj, touchend, fn[ta_up]);
					fn[ta_up] = null;
				}
				else if (evt === contextmenu && wrapContextMenu) {
					_unbind(obj, touchstart, fn[ta_context_down]);
					fn[ta_context_down] = null;
					_unbind(obj, touchend, fn[ta_context_up]);
					fn[ta_context_up] = null;
				}
				else
					_unbind(obj, touchMap[evt], fn);
			}
			
			_unstore(obj, evt, fn);
			_unbind(obj, evt, fn);

			return self;
		};

		/**
		* @name Mottle#remove
		* @function
		* @desc Removes an element from the DOM, and unregisters all event handlers for it. You should use this
		* to ensure you don't leak memory.
		* @param {String|Element} el Element, or id of the element, to remove.
		*/
		this.remove = function(el) {			
			el = typeof el == "string" ? document.getElementById(el) : el;
			if (el.__ta) {
				for (var evt in el.__ta) {
					for (var h in el.__ta[evt]) {
						_unbind(el, evt, el.__ta[evt][h]);
					}
				}
			}			
			if (el.parentNode) {
				el.parentNode.removeChild(el);
			}
		};

		/**
		* @name Mottle#on
		* @function
		* @desc Register an event handler, optionally as a delegate for some set of descendant elements. Note
		* that this method takes either 3 or 4 arguments - if you supply 3 arguments it is assumed you have 
		* omitted the `children` parameter, and that the event handler should be bound directly to the given element.
		* @param {Element|String} el Element - or ID of element - to bind event listener to.
		* @param {String} [children] Comma-delimited list of selectors identifying allowed children.
		* @param {String} event Event ID.
		* @param {Function} fn Event handler function.
		* @returns {Mottle} The current Mottle instance; you can chain this method.
		*/
		this.on = function(el, children, event, fn) {
			var _el = arguments[0],
				_c = arguments.length == 4 ? arguments[1] : null,
				_e = arguments[arguments.length - 2],
				_f = arguments[arguments.length - 1];
				
			/*var dlf = _makeDelegateFunction(el, children, fn);
			this.bind(el, event, dlf);
			fn.__tauid = dlf.__tauid; // copy the touch adapter guid into the original function. then unbind will work.
			_delegates[dlf.__tauid] = dlf;*/
			//this.bind(el, event, fn, children);
			_doBind(_el, _e, _f, _c);
			
			return this;
		};	

		/**
		* @name Mottle#off
		* @function
		* @desc Cancel delegate event handling for the given function. Note that unlike with 'on' you do not supply
		* a list of child selectors here: it removes event delegation from all of the child selectors for which the
		* given function was registered (if any).
		* @param {Element|String} el Element - or ID of element - from which to remove event listener.
		* @param {String} event Event ID.
		* @param {Function} fn Event handler function.
		* @returns {Mottle} The current Mottle instance; you can chain this method.
		*/
		this.off = function(el, event, fn) {
			var dlf = fn.__tauid ? _delegates[fn.__tauid] : null;
			if (dlf) {
				_doUnbind(el, event, dlf);
				delete _delegates[dlf.__tauid];
			}
			else
				_doUnbind(el, event, fn);

			return this;
		};

		/**
		* @name Mottle#trigger
		* @function
		* @desc Triggers some event for a given element.
		* @param {Element} el Element for which to trigger the event.
		* @param {String} event Event ID.
		* @param {Event} originalEvent The original event. Should be optional of course, but currently is not, due
		* to the jsPlumb use case that caused this method to be added.
		* @returns {Mottle} The current Mottle instance; you can chain this method.
		*/
		this.trigger = function(el, event, originalEvent) {
			var evt;
			if (document.createEvent) {
				evt = document.createEvent("MouseEvents");
				evt.initMouseEvent(event, true, true, window, 0,
								   originalEvent.screenX, originalEvent.screenY,
								   originalEvent.clientX, originalEvent.clientY,
								   false, false, false, false, 1, null);
				el.dispatchEvent(evt);
			}
			else if (document.createEventObject) {
				evt = document.createEventObject();
				evt.eventType = evt.eventName = event;
				evt.screenX = originalEvent.screenX;
				evt.screenY = originalEvent.screenY;
				evt.clientX = originalEvent.clientX;
				evt.clientY = originalEvent.clientY;
				el.fireEvent('on' + event, evt);
			}
			return this;
		}
	};
})();
