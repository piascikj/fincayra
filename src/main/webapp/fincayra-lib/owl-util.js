/* OWL JavaScript Utilities
   Oran Looney, April 2008

  This work is licensed under the Creative Commons Attribution 3.0 United 
  States License. To view a copy of this license, visit 
  http://creativecommons.org/licenses/by/3.0/us/ or send a letter to 
  Creative Commons, 171 Second Street, Suite 300, 
  San Francisco, California, 94105, USA.

*/

var owl; owl = owl || {};
owl.util = owl.util || (function() {

	function copy(obj) {
		// JavaScript doesn't have a 'copy' function, because each class will best know
		// how to copy itself. However, it is possible to provide a function that suffices for
		// many object, particularly Object literals.  This `copy()` will perform a shallow 
		// copy on core JavaScript objects and will probably work for most user-defined classes.
		//   This copies an object exactly, including it's internal prototype and value references.
		// Only properties that are directly attached to the source object are copied.
		// However, an object and a copy will not compare equal with == or ===.
		//   Also, while this works on core JavaScript types, it probably won't work on
		// DOM elements and other objects provided by the runtime environment.
		if (typeof obj !== 'object' ) {
			return obj;  // non-object have value sematics, so obj is already a copy.
		} else {
			var value = obj.valueOf();
			if (obj != value) { 
				// the object is a standard object wrapper for a native type, say String.
				// we can make a copy by instantiating a new object around the value.
				return new obj.constructor(value);
			} else {
				// ok, we have a normal object. If possible, we'll clone the original's prototype 
				// (not the original) to get an empty object with the same prototype chain as
				// the original.  If just copy the instance properties.  Otherwise, we have to 
				// copy the whole thing, property-by-property.
				if ( obj instanceof obj.constructor && obj.constructor !== Object ) { 
					var c = clone(obj.constructor.prototype);
				
					// give the copy all the instance properties of obj.  It has the same
					// prototype as obj, so inherited properties are already there.
					for ( var property in obj) { 
						if (obj.hasOwnProperty(property)) {
							c[property] = obj[property];
						} 
					}
				} else {
					var c = {};
					for ( var property in obj ) c[property] = obj[property];
				}
				
				return c;
			}
		}
	}

	/* NOTE: this is an older version of the clone.  It uses more memory by also creating
	         a new function object along with the clone.
	function clone(obj) {
		// A clone of an object is an empty object with a prototype reference to the original.
		// As such, you can access the current properties of the original through the clone.
		// If you set a clone's property, it will override the orignal's property, and
		// not affect the orignal. You can use the delete operator on the clone's overridden 
		// property to return to the earlier lookup behavior.

		function Clone() { } // a private constructor, used only by this one clone.
		Clone.prototype = obj;
		var c = new Clone();
		c.constructor = Clone;
		return c;
	}
	*/

	// This version of clone was inspired by the MochiKit clone function.
	function Clone() { }
	function clone(obj) {
		Clone.prototype = obj;
		return new Clone();
	}

	function chain(base, local) {
		// creates a scope chain, where the local properties are searched first, and then
		// the base properties.  The local properties are copied in, but base is cloned in.
		var chain = clone(base);
		for ( key in local ) {
			chain[key] = local[key];
		}
		return chain;
	}

	return { 
		copy:copy,
		clone:clone,
		chain:chain
	}

})();
