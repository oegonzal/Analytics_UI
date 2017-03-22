(function() {
    "use strict";
    
    var module = angular.module("networkRisk");

    module.animation('.slide', [slide]);

    function slide() {
    	return {
    		// make note that other events (like addClass/removeClass)
		    // have different function input parameters
		    enter: function(element, doneFn) {
		      	console.log("Inside enter of animation slider.");
		      	element.css('display', 'none');
		      	jQuery(element).fadeIn(4000, doneFn);
		    },

		    move: function(element, doneFn) {
		      	element.css('display', 'none');
		      	jQuery(element).fadeIn(4000, doneFn);
		    },

		    leave: function(element, doneFn) {
		      	console.log("Inside leave of animation slider.");
		      	jQuery(element).fadeOut(4000, doneFn);
		    },

		    beforeAddClass: function(element, doneFn) {
		    	//element.css('display', 'none');
		      	console.log("Inside add of animation slider.");
		      	jQuery(element).animate({
                    //opacity: 0.25,
                    //left:    "+450",
                    height:  "toggle",
                }, 1000);
		    },

		    beforeRemoveClass: function(element, doneFn) {
		    	element.css('display', 'none');
		    	console.log("Inside remove of animation slider.");
		      	jQuery(element).animate({
                    //opacity: 0.25,
                    //left:    "+450",
                    height:  "toggle",
                }, 1000);
		    }
    	}
    }

}());