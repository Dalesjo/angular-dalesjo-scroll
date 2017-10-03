angular.module("dalesjo.scroll", [

])
.service('scrollService',[
  function() {
    var callbacks = [];
    return  {
      notify: function() {
        for(var i=0,c=callbacks.length; i < c; i++) {
          callbacks[i].apply(this, arguments);
  	    }
      },
      register: function(callback) {
        callbacks.push(callback);
      },
      unregister: function(callback) {
        for(var i=0,c=callbacks.length; i < c; i++) {
    			if(callbacks[i] === callback) {
    				callbacks.splice(i, 1);
    			}
    		}
      }
    }
  }
])
.factory('scrollFactory', function ($window,scrollService) {

  var getPageY = function() {
    return supportPageOffset ? $window.pageYOffset : isCSS1Compat ? $window.document.documentElement.scrollTop : $window.document.body.scrollTop
  };

  var scrollHandler = function(e) {
    var pageY = getPageY();
    if(scrollData.windowYPosition - pageY > scrollData.minimumChange || scrollData.windowYPosition - pageY < -Math.abs(scrollData.minimumChange)) {
      scrollData.windowYPosition = pageY;
      scrollService.notify(scrollData);
    }
  };

  var resizeHandler = function(e) {
    if(scrollData.windowHeight - e.target.innerHeight > scrollData.minimumChange || scrollData.windowHeight - e.target.innerHeight < -Math.abs(scrollData.minimumChange)) {
      scrollData.windowHeight = e.target.innerHeight;
      scrollData.minimumChange = e.target.innerHeight/5;
      scrollService.notify(scrollData);
    }
  };

  /* Cross browser compabilty to check pageYOffset
   * src: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY */
  var supportPageOffset = window.pageYOffset !== undefined,
      isCSS1Compat = (($window.document.compatMode || "") === "CSS1Compat");

  /* data sent to listeners of scrollService */
  var scrollData = {
    /* Height of current browser (viewable area of page) */
    windowHeight: $window.innerHeight,
    /* Current scroll position of page */
    windowYPosition: getPageY(),
    /* 1/5 of the page must be scrolled before scrollService notify any listener */
    minimumChange:$window.innerHeight/5
  };

  angular.element(document).ready(function () {
    angular.element($window).on("scroll", scrollHandler);
    angular.element($window).on("resize", resizeHandler);

    scrollHandler();
  });

  return scrollData;

})
.directive('daHasBeenVisible', function(scrollFactory,scrollService) {
  return {
    restrict: 'A',
    scope: {
      daHasBeenVisible: '=',
    },
    //template: 'This is my supercool directive',
    link: function (scope, element, attrs) {

      var isVissible = function(scrollData) {
        if(scrollData.windowHeight+scrollData.windowYPosition > element[0].offsetTop && scrollData.windowYPosition < element[0].offsetTop){
          scrollService.unregister(isVissible);

          scope.$apply(function() {
            scope.daHasBeenVisible = true;
          });
        }
      }

      scrollService.register(isVissible);
    }
  };
});
