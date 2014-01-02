#mottle
=============

Mottle is a simple wrapper that allows you to register event listeners for mouse events and have those listeners respond to the corresponding touch devices.  Support for `click`/`dblclick`/`contextmenu` is also included. I created this because I wanted a simple way to normalise a UI I was building across desktop and mobile, and I didn't need a mobile framework; just touch events.

##Browser Support

Currently, all desktop browsers and iOS devices are supported.  Support for Android will be coming shortly.

##Requirements

#### 0.1

Version 0.1 of Mottle runs either stand alone (requiring no external library), or it can run on top of jQuery - which is to say that it maps to jQuery's event binding methods.  It was originally my intention to create other library wrappers, but I haven't yet got around to it. And, for reasons discussed in the 0.2 requirements section below, it is not likely I will get around to it.

#### 0.2

Version 0.2 has abandoned integration with an external library, for various reasons (all of which, I can assure you, are excellent).

##Event Mapping

The three basic touch events are mapped in this way:

- __touchstart__ -> __mousedown__
- __touchend__ -> __mouseup__
- __touchmove__ -> __mousemove__

In addition,TouchAdapter supports `click`, `dblclick` and `contextmenu`, by starting a timer on touchstart and then checking if the touchend event happens within a certain threshold afterwards.  For the `contextmenu` event, touch-adapter looks for a touchstart+touchend using two fingers (this is one way you can do a right-click on the Mac's trackpad).

##Smart click handling (0.2 only)

By default, all browsers consider a `mouseup` event on some element on which there was recently a `mousedown` to be sufficient cause to fire a `click` event.  If the mouse has moved between `mousedown` and `mouseup`, though, for many applications it is absolutely not the case that the two events should be considered a `click`. So you can pass a parameter to the TouchAdapter constructor to tell it that `click` should only be fired if the mouse has not moved between `mousedown` and `mouseup`.

##Usage

### 0.2

#### Constructor

	var mottle = new Mottle(PARAMS);

Allowed constructor parameters are:

- **smartClicks** If true, will not report click events if the mouse has moved between mousedown and mouseup.
- **clickThreshold** Amount of time, in milliseconds, inside of which a mousedown should be followed by a mouseup in order to be considered as a click in a touch device. Default is 150ms.
- **dblClickThreshold** Amount of time, in milliseconds, inside of which two consecutive clicks must occur in order to be considered a double click in a touch device. Default is 250ms.

#### Event Binding

To directly bind an event handler on some element, use `bind`:

	mottle.bind(someElement, "click", aFunction);
	mottle.bind(someElement, "dblclick", anotherFunction);	

To subsequently unbind, use `unbind`. Note you have to supply the original function:

	mottle.unbind(someOtherElement, "dblclick", anotherFunction);

#### Event Delegation

To have some element act as an event handling delegate for some set of its child elements, use `on`:

	mottle.on(someElement, "div.foo, div.bar", "click", aFunction);

To remove the event delegation, use `off`:

	mottle.off(someElement, "click", aFunction);

Note that the `off` function does not take a list of selectors as argument. It removes all event delegation for the set of child selectors with which the given function was registered.

---

### 0.1

###Standalone

First create one:

	var mottle = new Mottle();

..and you make calls to `bind` and `unbind`:

	mottle.bind(someElement, "click", aFunction);
	mottle.unbind(someOtherElement, "dblclick", anotherFunction);

Note that `bind` and `unbind` are chainable:

	mottle.bind(someElement, "click", aFunction).unbind(someOtherElement, "dblclick", anotherFunction);

Your event callbacks, when using the standalone Mottle, will be passed native browser events.

Mottle's constructor can take a params object, with five possible values (all are optional):

- __bind__ a function to use for binding event listeners. if this is not provided, touch-adapter uses its own default method.
- __unbind__ a function to use for unbinding event listeners. Same deal as for bind if not provided.
- __unwrap__ a function to use for unwrapping an event to its original event. Not required if you are using native DOM events, but the library specific subclasses of touch-adapter all provide an unwrap function.
- __clickThreshold__ number of milliseconds within which the user must release a touch in order for us to register a click. Defaults to 150.
- __doubleClickThreshold__ number of milliseconds within which two consecutive clicks must be registered in order for us to register a double click. Defaults to 250.

###jQuery

The jQuery Mottle can be used either as a JS object that you instantiate, but it also registers itself as a plugin.

####jQuery Standalone

Using the jQuery Mottle standalone is a lot like using the native standalone version:

	var mottle = new jQueryMottle();

..and you then make calls to `bind` and `unbind`:

	mottle.bind(someElement, "click", aFunction);
	mottle.unbind(someOtherElement, "dblclick", anotherFunction);

(when I say a lot like it, I mean __the same__).  The only difference is that your callbacks will be passed jQuery event objects.

####jQuery Plugin

For lovers of selector soup, Mottle registers two handy methods on the jQuery function object:

	$("#someElement").taBind("click", someFunction);
	$("#someElement").taUnbind("dblclick", someOtherFunction);

These are, of course, chainable:

	$("#someElement").taBind("click", someFunction).taBind("dblclick", someOtherFunction);

What about `delegate`, `live` and `on` ?  I'll add these if someone asks for them.  Seems like they would be a nice to have.

###MooTools

Coming shortly.

###YUI3

Thinking about doing this too. But YUI3 seems to have pretty decent touch event support already.






