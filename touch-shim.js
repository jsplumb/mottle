
/**
 * These are shims for document.createTouch and document.createTouchList, which Chrome has removed from M69 and which
 * other browser "vendors" are going to remove too. These are not required for the current version of Mottle. I put them
 * here for people to use with older versions of jsPlumb that they cannot upgrade.
 */

if (!document.createTouch) {
    /**
     * Creates a Touch object.
     * @param view
     * @param target
     * @param pageX
     * @param pageY
     * @param screenX
     * @param screenY
     * @param clientX
     * @param clientY
     * @returns {Touch}
     * @private
     */
    document.createTouch = function(view, target, pageX, pageY, screenX, screenY, clientX, clientY) {

        return new Touch({
            target: target,
            identifier: _uuid(),
            pageX: pageX,
            pageY: pageY,
            screenX: screenX,
            screenY: screenY,
            clientX: clientX || screenX,
            clientY: clientY || screenY
        });
    };
}

if (!document.createTouchList) {
    /**
     * Create a synthetic touch list from the given list of Touch objects.
     * @returns {Array}
     * @private
     */
    document.createTouchList = function() {
        var list = [];
        Array.prototype.push.apply(list, arguments);
        list.item =  function(index) { return this[index]; };
        return list;
    };
}
