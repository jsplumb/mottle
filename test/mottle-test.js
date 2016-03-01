var divs = [],
    _add = function (id, className, parent) {
        var d = document.createElement("div");
        d.setAttribute("id", id);
        if (className) d.className = className;
        divs.push(d);
        (parent || document.body).appendChild(d);
        return d;
    },
    _clear = function () {
        for (var i = 0; i < divs.length; i++) {
            try {
                divs[i].parentNode.removeChild(divs[i]);
            }
            catch (e) {
            }
        }
        divs.length = 0;
        //m.reset();
    },
    m;

var testSuite = function () {

    module("Mottle", {
        teardown: _clear,
        setup: function () {
            m = new Mottle();
        }
    });

    test("bind a click on document and trigger one, no original event", function () {
        var a = null;
        m.on(document, "click", function () {
            a = "done";
        });
        m.trigger(document, "click");
        equal(a, "done", "click event was registered and triggered");
    });

    test("event delegation: bind a click on document with div filters and trigger one, no original event", function () {
        var d1 = _add("d1", "foo");
        var d2 = _add("d2", "foo");
        var d3 = _add("d3", "bar");
        var a = null;
        m.on(document, "click", ".foo", function () {
            a = "done";
        });
        m.trigger(d2, "click");
        equal(a, "done", "click event was registered and triggered");
        a = null;
        m.trigger(d3, "click");
        equal(a, null, "click event did not fire for unregistered selector");
    });

    test("bind a click and trigger one, no original event", function () {
        var d = _add("d1");
        var a = null;
        m.on(d, "click", function () {
            a = "done";
        });
        m.trigger(d, "click");
        equal(a, "done", "click event was registered and triggered");
    });

    test("bind a click, two elements in array, and trigger one, no original event", function () {
        var d = _add("d1"), d2 = _add("d2");
        var a = null;
        m.on([d, d2], "click", function () {
            a = "done";
        });
        m.trigger(d, "click");
        equal(a, "done", "click event was registered and triggered");
        a = null;
        m.trigger(d2, "click");
        equal(a, "done", "click event was registered and triggered");
    });

    test("bind a click by id, trigger event, no original event", function () {
        var d = _add("d1");
        var a = null;
        m.on("#d1", "click", function () {
            a = "done";
        });
        m.trigger("#d1", "click");
        equal(a, "done", "click event was registered and triggered");
    });

    test("trigger by selector", function () {
        var d = _add("d1"), d2 = _add("d2");
        d.className = "foo";
        d2.className = "foo";
        var a = 0;
        m.on([d, d2], "click", function () {
            a++;
        });
        m.trigger(document.querySelectorAll(".foo"), "click");
        equal(a, 2, "click event was registered and triggered on both elements");
    });

    test("bind and trigger by selector", function () {
        var d = _add("d1"), d2 = _add("d2");
        d.className = "foo";
        d2.className = "foo";
        var a = 0, fooDivs = document.querySelectorAll(".foo");
        m.on(fooDivs, "click", function () {
            a++;
        });
        m.trigger(fooDivs, "click");
        equal(a, 2, "click event was registered and triggered on both elements");
    });

    test("bind a click and delete the element, then unbind", function () {
        var d = _add("d1");
        var a = 0;
        var f = function () {
            a++;
        };
        m.on(d, "click", f);
        m.trigger(d, "click");
        equal(a, 1, "event was fired");
        m.trigger(d, "click");
        equal(a, 2, "event was fired again");
        m.off(d, "click", f);
        m.trigger(d, "click");
        equal(a, 2, "event was not fired again after unbind");

    });

    /**
     * Tests that unbinding from a deleted element does not fail.
     * @method Mottle.Test.UnbindFromDeletedElement
     */
    test("bind a click and delete the element, then unbind", function () {
        var d = _add("d1");
        var a = null;
        var f = function () {
            a = "done";
        };
        m.on(d, "click", f);
        d.parentNode.removeChild(d);
        try {
            // get element; it has been removed and is now null.
            // i could of course just pass null in here ....
            var dd = document.getElementById("d1");
            m.off(dd, "click", f);
            ok(true, "unbind should not throw an error");
        }
        catch (e) {
            ok(false, "unbind should not throw an error");
        }
    });

    /**
     * Tests that binding to a null element does not fail.
     * @method Mottle.Test.BindNullElement
     */
    test("bind to a null element", function () {
        expect(1);
        m.on(null, "dblclick", function () {

        });
        ok(true, "bind to null did not fail");
    });

    /**
     * Tests that binding a null function does not fail.
     * @method Mottle.Test.BindNull
     */
    test("bind a null function", function () {
        expect(1);
        var d = _add("d1");
        m.on(d, "click", null);
        ok(true, "bind with null function did not fail");
    });

    /**
     * Tests that unbinding a null function does not fail.
     * @method Mottle.Test.UnbindNull
     */
    test("unbind a null function", function () {
        expect(1);
        var d = _add("d1");
        m.on(d, "click", function () {
        });
        m.off(d, "click", null);
        ok(true, "unbind with null function did not fail");
    });

    /**
     * Tests bind and remove functionality when using a dom element as argument.
     * @method Mottle.Test.BindRemoveWithElement
     */
    test("bind and remove using Mottle, element as arg", function () {
        var d = _add("d1");
        var a = 0;
        m.on(d, "click", function () {
            a++;
        });
        m.remove(d);
        ok(d.parentNode == null, "div was removed from the dom");
        m.trigger(d, "click");
        ok(a == 0, "event was not fired");
    });

    /**
     * Tests bind and remove functionality when using a document query selector as argument.
     * @method Mottle.Test.BindRemoveWithQuerySelector
     */
    test("bind and remove using Mottle, selector arg", function () {
        var d = _add("d1"), d2 = _add("d2");
        var a = 0;
        d.className = "foo";
        d2.className = "foo";
        var divs = document.querySelectorAll(".foo");
        m.on(divs, "click", function () {
            a++;
        });
        m.trigger(divs, "click");
        ok(a == 2, "event was not fired");
        m.remove(divs);
        ok(d.parentNode == null, "div was removed from the dom");
        ok(d2.parentNode == null, "div was removed from the dom");
        m.trigger(divs, "click");
        ok(a == 2, "event was not fired");
    });

    /**
     * Tests the `forceTouchEvents` method, by setting the flag to true and then binding a listener
     * to the `mousedown` event. Then, a `touchstart` event is triggered. This should be mapped back to
     * its mouse equivalent - `mousedown`.
     * @method Mottle.Test.ForceTouchEvents
     */
    test("force touch events, bind to mousedown, and trigger a touchstart.", function () {
        Mottle.setForceTouchEvents(true);
        var d = _add("d1"), t = 0;
        m.on(d, "mousedown", function () {
            t += 1;
        });

        m.trigger(d, "touchstart");
        equal(t, 1, "event was fired and captured");

        Mottle.setForceTouchEvents(false);
    });

    test("basic click delegation", function() {
        var d = _add("d1"), d2 = _add("d2", "aChild", d);

        var child = false;

        m.on(d, "click", ".aChild", function(e) {
            child = true;
            ok(this === d2, "correct element set as the source of the event");
        });

        m.trigger(d2, "click");
        ok(child, "click event was delegated");
    });

    test("click delegation, click on child of event specified in delegate selector", function() {
        var d = _add("d1"), d2 = _add("d2", "aChild", d), d3 = _add("d3", null, d2);

        var child = false;

        m.on(d, "click", ".aChild", function(e) {
            child = true;
            equal(this, d2, "correct element set as the source of the event");
        });

        m.trigger(d3, "click");
        ok(child, "click event was delegated");
    });

    test("basic tap delegation", function() {
        var d = _add("d1"), d2 = _add("d2", "aChild", d);

        var child = false;

        m.on(d, "tap", ".aChild", function(e) {
            child = true;
            ok(this === d2, "correct element set as the source of the event");
        });

        m.trigger(d2, "mousedown");
        m.trigger(d2, "mouseup");
        ok(child, "tap event was delegated");
    });

    test("tap delegation, click on child of event specified in delegate selector", function() {
        var d = _add("d1"), d2 = _add("d2", "aChild", d), d3 = _add("d3", null, d2);

        var child = false;

        m.on(d, "tap", ".aChild", function(e) {
            child = true;
            ok(this === d2, "correct element set as the source of the event");
        });

        m.trigger(d3, "mousedown");
        m.trigger(d3, "mouseup");
        ok(child, "click event was delegated");
    });

// -------------------- blur/focus -------------------------------------------

    asyncTest("blur/focus events", function() {
        var d = _add("d1"), d2 = _add("d2");
        d2.setAttribute("tabindex", 1); //allow d2 to grab focus so that the blur gets fired.
        var a = 0, b = 0;
        m.on(d, "focus", function () {
            a = a + 1;
            d2.focus();
        });
        m.on(d, "blur", function () {
            b = b+1;
            QUnit.start();
            equal(a, 1, "focus event captured");
            equal(b, 1, "blur event captured");
        });
        d.focus();

    });

    /**
     * Tests the functionality that filters out mouse events for which a touch event has recently been fired.
     * This occurs on devices that have a touch screen and a mouse, which is not uncommon for windows computers
     * these days.  The algorithm employed to do this filtering is not exactly rocket science, because it can't be;
     * there is no information linking the touch event and its corresponding mouse event. Mottle uses three pieces
     * of information to determine whether or not a mouse event should be filtered: first, whether the device
     * reports that it supports both touch and mouse events. Second, the event needs to have occurred "shortly" after
     * a matching touch event (eg a mousedown a few ms after a touchstart). Third, the event's location must be
     * within some proximity of the previous touch event.
     * @method Mottle.Test.TouchMouseDuplication
     *
     test("filter duplicate mouse events.", function() {
        ok(true, "YOU MUST EITHER BE ON A TOUCH DEVICE OR EMULATE TOUCH EVENTS FOR THIS TEST TO WORK");
        Mottle.setForceTouchEvents(true);
        var d = _add("d1"), t = 0;
        m.on(d, "mousedown", function() {
            t += 1;
        });

        m.trigger(d, "touchstart");

        if (typeof document.createTouch == "undefined")
        {
            document.createTouch = function () {
                return {};
            };

            document.createTouchList = function (t) {
                return [t];
            };
        }

        m.trigger(d, "mousedown");

        equal(t, 1, "event was fired and captured only once.");
    });*/


};