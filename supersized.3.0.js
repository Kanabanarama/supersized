(function($) {

  $.fn.supersized = function(options) {
    var opts = $.extend({}, $.fn.supersized.defaults, (options || {}));

    return this.
      hide().

      bind("load.super", function() {
        var $this = $(this);
        if ($this.data("loaded")) return;
        $this.data("loaded", true);
        log("loading supersize");
        $this.fadeIn('fast');
        $this.trigger("showslide.super", 0);
        $this.trigger("resizenow.super");
        $this.trigger("play.super");
        if (typeof opts.load == 'function') opts.load.call(this);
      }).

      bind("nextslide.super", function(e, transition) {
        var $this = $(this),
            next = indexOfCurrentSlide.call(this) + 1;
        log(e.type, next, "waiting:", $this.data("animating"), "transition:", transition);
        showSlide.call(this, next, transition, opts.duration);
      }).

      bind("prevslide.super", function(e, transition) {
        var $this = $(this),
            next = indexOfCurrentSlide.call(this) - 1;
        log(e.type, next, "waiting", $this.data("animating"));
        showSlide.call(this, next, transition, opts.duration);
      }).

      bind("showslide.super", function(e, data) {
        data = data || {};
        var index = typeof data == 'number' ? data : data.index;
        showSlide.call(this, index, (data.transition || false), opts.duration);
      }).

      bind("onchange.super", function(e, data) {
        if (typeof opts.onchange == 'function') opts.onchange.call(this, data);
      }).

      bind("pause.super", function(e, trigger) {
        var $this = $(this);
        if (typeof opts.pause == 'function') opts.pause.call(this, trigger);
        $this.trigger("stopinterval.super");
        $this.data("paused", true);
      }).

      bind("play.super", function(e, trigger) {
        var $this = $(this);
        if (typeof opts.play == 'function') opts.play.call(this, trigger);
        $this.trigger("startinterval.super");
        $this.data("paused", false);
      }).

      bind("resizenow.super", function(e, $img) {
        var $this = $(this),
            $img  = $img ? $($img) : $this.find('img');
        resizeSlideshow.call(this, $img, opts);
        if (typeof opts.resize == 'function') opts.resize.call(this);
      }).

      bind("stopinterval.super", function() {
        var interval = $(this).data("interval");
        if (interval) clearInterval(interval);
      }).

      bind("startinterval.super", function() {
        var $this = $(this);
        $this.data("interval", setInterval(function() {
            log("startinterval.super", opts.transition);
            $this.trigger("nextslide.super", opts.transition);
          }, opts.interval)
        );
      }).

      each(function() {
        var $this = $(this),
            childCss  = { position: "absolute", top: 0, left: 0, height:"100%", width:"100%", margin: 0 },
            buttons   = opts.buttons || {};

        if (typeof opts.init == 'function') opts.init.call(this);

        // TODO support css for dynamically loaded images
        $this.css("position", "fixed").children().css(childCss).find('img').css(childCss);

        $(window).bind('resize', function(e) {
          $this.trigger('resizenow.super');
        });

        if (buttons.pause) {
          $(buttons.pause).live("click", function(e) {
            if ($this.data("paused")) {
              $this.trigger("play.super", e.type);
            } else {
              $this.trigger("pause.super", e.type);
            }
            e.preventDefault();
          });
        }

        if (buttons.next) {
          $(buttons.next).live("click", function(e) {
            $this.trigger("nextslide.super");
            if ($this.data('paused')) return;
            $this.trigger("stopinterval.super");
            $this.trigger("startinterval.super");
            e.preventDefault();
          });
        }

        if (buttons.prev) {
          $(buttons.prev).live("click", function(e) {
            $this.trigger("prevslide.super");
            if ($this.data('paused')) return;
            $this.trigger("stopinterval.super");
            $this.trigger("startinterval.super");
            e.preventDefault();
          });
        }

        if ($.preload && opts.preload) {
          $.preload(opts.preload, {
            notFound: opts.notFound,
            placeholder: opts.placeholder,
            onComplete: function(data) {
              var $img = $this.find("img[src*='" + data.image + "']");
              if (data.found) $img.parent("a").addClass("loaded");
              if (!$this.data("loaded")) $this.trigger("load.super");
              $this.trigger("resizenow.super", $img);
            },
            onFinish: function(data) {
              log("preload finished", data);
              $this.trigger("load.super");
            }
          });
        } else {
          $this.trigger("load.super");
        }
      })
      ;
  };

  var CURRENT_SLIDE = 'ss_current_slide',

  showSlide = function(index, transition, duration) {
    index       = index || null;
    transition  = transition || false;
    var $this = $(this),
        $children = $this.children(),
        total = $children.size(),
        $current = $this.children("." + CURRENT_SLIDE),
        duration = duration || $.fn.supersized.defaults.duration,
        $next, onShowComplete;

    if ($this.data("animating")) return;
    $this.data("animating", transition);

    if ( !index || index >= total ) {
      //invalid index, go back to start
      index = 0;
      $next = $children.first();
    } else if ( index < 0 ) {
      index = total - 1;
      $next = $children.last();
    } else {
      $next = $children.eq(index);
    }

    $current.removeClass(CURRENT_SLIDE).css("z-index", 1);
    $next.addClass(CURRENT_SLIDE).css({
      opacity: 0,
      "z-index": 2
    });

    onShowComplete = function() {
      var text = getCaption($next);
      log("showslide.super", text, index, total, transition);
      $current.css("z-index", -1);
      $next.css("opacity", 1);
      $this.data("animating", false);
      $this.trigger("onchange.super", {
        title: text,
        index: index,
        total: total
      });
    };

    if (transition == 'fadeIn') {
      $next.animate({
        opacity: 1
      }, duration, onShowComplete);
    } else {
      $next.show().css("opacity", 1);
      onShowComplete();
    }
    return this;
  },

  resizeSlideshow = function($img, opts) {
    var $this = $(this),
    $window = $(window),
    browserWidth  = $window.width(),
    browserHeight = $window.height();

    $this.height(browserHeight);
    $this.width(browserWidth);

    $img.each(function() {
      $img.trigger("resizing.super");
      resizeImage.call(this, browserWidth, browserHeight, opts);
    });
  },

  resizeImage = function(browserWidth, browserHeight, opts) {
    var $img = $(this),
        imageWidth  = $img.attr('naturalWidth'),
        imageHeight = $img.attr('naturalHeight'),
        imageRatio  = imageHeight / imageWidth,
        browserRatio  = (browserHeight / browserWidth);

    if ( browserRatio > imageRatio && opts.crop ) {
      $img.height(browserHeight);
      $img.width(browserHeight / imageRatio);
    } else {
      $img.width(browserWidth);
      $img.height(browserWidth * imageRatio);
    }

    if (opts.center) {
      $img.css('left', (browserWidth - $(this).width()) / 2);
      $img.css('top', (browserHeight - $(this).height()) / 2);
    }
  },

  log = function() {
    if (window.console && window.console.log) window.console.log.apply(window.console, arguments);
  },
  emptyFunction = function() {},

  indexOfCurrentSlide = function() {
    var $this = $(this),
        current = $this.children("." + CURRENT_SLIDE)[0],
        arr     = $this.children().get();
    return parseInt($.inArray(current, arr) || 0, 10);
  },

  getCaption = function($el) {
    var $img = $el.find('img');
    return $img.attr("title") || $img.attr("alt") || "";
  };

  $.fn.supersized.defaults = {
    interval: 5000,
    duration: 750,
    transition: false,
    center  : true,
    crop    : true,
    preload : [],
    notFound: null,
    placeholder: null,
    buttons     : {
      pause : null,
      next  : null,
      prev  : null
    },
    init        : emptyFunction,
    load        : emptyFunction,
    onchange    : emptyFunction,
    pause       : emptyFunction,
    play        : emptyFunction
  };

})(jQuery);