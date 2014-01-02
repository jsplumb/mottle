var divs  =[],
	_add = function(id) {
		var d = document.createElement("div");
		d.setAttribute("id", id);
		divs.push(d);
		document.body.appendChild(d);
		return d;
	},
	_clear = function() {
		for (var i = 0; i < divs.length; i++) {
			divs[i].parentNode.removeChild(divs[i]);
		}
		divs.length = 0;
		//m.reset();
	},
	m;

var testSuite = function() {
	
	module("Mottle", {
		teardown: _clear,
		setup:function() {
            m = new Mottle();
		}
	});
    
    test("change scope of draggable, via katavorio instance, on element", function() {
        
    });
	
	test("change scope of droppable, via katavorio instance, on element", function() {
        
    });
	
	
	
};