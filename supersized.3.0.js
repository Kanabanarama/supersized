(function($) {

  $.fn.supersized = function(options) {
    var opts = $.extend({}, $.fn.supersized.defaults, (options || {}));

    return this.hide().
      bind("load.super", function() {
        var $this = $(this);
        if (typeof opts.load == 'function') opts.load();
        $this.fadeIn('fast');
        $this.trigger("showslide.super");
        $this.superresizenow(opts);
        setInterval(function() {
          $this.trigger("nextslide.super");
        }, opts.interval);
      }).
      bind("nextslide.super", function() {
        var $this = $(this), next = indexOfCurrentSlide.call($this) + 1;
        log("nextslide.super", next, "waiting", $this.data("animating"));
        $this.trigger("showslide.super", next);
      }).
      bind("showslide.super", function(e, index) {
        var $this = $(this),
            total = $this.children().size(),
            $current = $this.children("." + CURRENT_SLIDE),
            $next, text;

        if ($this.data("animating")) return;
        $this.data("animating", true);

        if ( !index || index >= total || index < 0 ) {
          //invalid index
          index = 0;
          $next = $this.children().first();
        } else {
          $next = $this.children().eq(index);
        }

        $current.removeClass(CURRENT_SLIDE).css("z-index", 1);
        $next.addClass(CURRENT_SLIDE).css("z-index", 2).hide().fadeIn(750, function() {
          $this.data("animating", false);
        });

        text = $next.find('img').attr("title") || $next.find('img').attr("alt") || "";
        log("showslide.super", text, index, total);
        $this.trigger("onchange.super", {
            title: text,
            index: index,
            total: total
          });
      }).
      bind("onchange.super", function(e, data) {
        if (typeof opts.onchange == 'function') opts.onchange(data);
      }).
      each(function() {
        var $this = $(this), childCss = { position: "absolute", top: 0, left: 0, height:"100%", width:"100%" };
        if (typeof opts.init == 'function') opts.init();

        $this.css("position", "fixed").children().each(function() {
          $(this).find('img').andSelf().css(childCss);
        });

        $(window).bind('resize', function() {
          $this.superresizenow();
        });

        $this.trigger("load.super");
      })
      ;
  };

  $.fn.superresizenow = function(options) {
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

        if (opts.center) {
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

  $.fn.supersized.defaults = {
    interval: 5000,
    center  : true,
    crop    : true,
    init  : emptyFunction,
    load      : emptyFunction,
    onchange    : emptyFunction,

    loading : "#loading",
    chrome  : "#chrome"
  };

})(jQuery);


$(function(){
   // transition 0-None, 1-Fade, 2-slide top, 3-slide right, 4-slide bottom, 5-slide left
  $('#slideshow').supersized({
    onchange: function(data) {
      var title = data.title,
          index = data.index,
          total = data.total;
      $("#slidecaption").text(title);
      $("#slidecounter .current").html((parseInt(index) + 1) + "");
      $("#slidecounter .total").html(total);
    },
    load: function() {
      $("#loading").hide();
      $("#chrome").show();
    },
    init: function() {
      $("#loading").show();
      $("#chrome").hide();
    }
  });
});
