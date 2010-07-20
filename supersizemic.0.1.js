(function($) {

  $.fn.supersizemic = function(options) {
    var opts = $.extend({}, $.fn.supersizemic.defaults, (options || {}));

    return this.hide().
      bind("load.super", function() {
        var $this = $(this);
        $(opts.loading).hide();
        $(opts.content).show();
        $this.fadeIn('fast');
        $this.trigger("showslide.super");
        $this.resizenow(opts);
        setInterval(function() {
          $this.trigger("nextslide.super");
        }, opts.interval);
      }).
      bind("nextslide.super", function() {
        var $this = $(this), next = indexOfCurrentSlide.call($this) + 1;
        log("nextslide.super", next);
        $this.trigger("showslide.super", next);
      }).
      bind("showslide.super", function(e, index) {
        var $this = $(this),
            total = $this.children().size(),
            $current = $this.children("." + CURRENT_SLIDE),
            $next, title;
        if ($this.data("animating")) return;
        $this.data("animating", true);

        if ( !index || index >= total || index < 0 ) {
          //invalid index
          index = 1;
          $next = $this.children().first();
        } else {
          $next = $this.children().eq(index);
        }

        $current.removeClass(CURRENT_SLIDE).css("z-index", 1);
        $next.addClass(CURRENT_SLIDE).css("z-index", 2).fadeIn(750, function() {
          $this.data("animating", false);
        });

        title = $next.attr("title") || $next.attr("alt") || "";
        log("showslide.super", title, index, total);
        // set caption
        $this.trigger("caption.super", title);
        $this.trigger("counter.super", [index, total]);
      }).
      bind("caption.super", function(e, title) {
        opts.caption(title);
      }).
      bind("counter.super", function(e, index, total) {
        opts.counter(index, total);
      }).
      trigger("showslide.super").
      each(function() {
        var $this = $(this);
        $(window).bind("load", function() {
          $this.trigger("load.super");
        });
      })
      ;
  };

  $.fn.resizenow = function(options) {
    opts = options || {};
    return this.each(function() {
      var $this = $(this),
      $window = $(window),
      browserwidth = $window.width(),
      browserheight = $window.height();

      $this.height(browserheight);
      $this.width(browserwidth);

      $this.find('img').each(function() {
        var $img = $(this),
            imagewidth = $img.attr('naturalWidth'),
            imageheight = $img.attr('naturalHeight'),
            ratio = imageheight / imagewidth;

        if ( (browserheight / browserwidth) > ratio && opts.crop ) {
          $img.height(browserheight);
          $img.width(browserheight / ratio);
        } else {
          $img.width(browserwidth);
          $img.height(browserwidth * ratio);
        }

        if (options.center) {
          $img.css('left', (browserwidth - $(this).width()) / 2);
          $img.css('top', (browserheight - $(this).height()) / 2);
        }

      });
    });
  };


  var CURRENT_SLIDE = 'ss_current_slide',

  log = function() {
    if (window.console && window.console.log) window.console.log.apply(window.console, arguments);
  },
  emptyFunction = function() {},

  indexOfCurrentSlide = function() {
    // call with $(this)
    var current = this.children("." + CURRENT_SLIDE)[0],
        arr     = this.children().get();
    return parseInt($.inArray(current, arr) || 0, 10);
  };

  $.fn.supersizemic.defaults = {
    interval: 5000,
    caption : function() {},
    counter : function() {},
    center  : true,
    crop    : true,

    loading : "#loading",
    chrome  : "#content"
  };

})(jQuery);