(function($) {

  $.fn.supersized = function(options) {
    var self = this,
        opts = $.extend({}, $.fn.supersized.defaults, options),
        slideshow = new Slideshow(this, opts);
        self.slideshow = slideshow;

    self.data("slideshow", slideshow);

    self.bind("initialize.super", function() {
      slideshow.load();
    }).

    bind("resizenow.super", function(e, img) {
      slideshow.resize(img);
    });

    if (opts.playSlides) {

      self.bind("nextslide.super", function(e, transition) {
        slideshow.nextSlide(transition, opts.duration);
      }).

      bind("prevslide.super", function(e, transition) {
        slideshow.prevSlide(transition, opts.duration);
      }).

      bind("showslide.super", function(e, data) {
        data = data || {};
        var index = typeof data == 'number' ? data : data.index;
        slideshow.showSlide(index, (data.transition || false), opts.duration);
      }).

      bind("onchange.super", function(e, data) {
        if (typeof opts.onchange == 'function') opts.onchange.call(this, data);
      }).

      bind("pause.super", function(e, trigger) {
        slideshow.pause(trigger, opts);
      }).

      bind("play.super", function(e, trigger) {
        slideshow.play(trigger);
      }).

      bind("stopinterval.super", function() {
        slideshow.stopInterval();
      }).

      bind("startinterval.super", function() {
        slideshow.startInterval();
      });
    }

    self.each(function() {
      var _this = this,
          $this = $(this),
          childCss  = { position: "absolute", top: 0, left: 0, height:"100%", width:"100%", margin: 0 },
          buttons   = opts.buttons || {};
          _this.buttons = buttons;

      if (typeof opts.init == 'function') opts.init.call(this);

      $this.css("position", "fixed").children().css(childCss).find("img").css("position", "relative");

      $.fn.supersized.browser.bind('resize', function(e) {
        $this.trigger('resizenow.super');
      });

      if (buttons.pause) {
        $(buttons.pause).live("click", function(e) {
          if (slideshow.isPaused()) {
            slideshow.play(e.type);
          } else {
            slideshow.pause(e.type);
          }
          e.preventDefault();
        });
      }

      if (buttons.next) {
        $(buttons.next).live("click", function(e) {
          slideshow.nextSlide();
          if (slideshow.isPaused()) return;
          slideshow.restartInterval();
          e.preventDefault();
        });
      }

      if (buttons.prev) {
        $(buttons.prev).live("click", function(e) {
          slideshow.prevSlide();
          if (slideshow.isPaused()) return;
          slideshow.restartInterval();
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
            if (!$this.data("loaded")) slideshow.load();
            slideshow.resize($img);
          },
          onFinish: function(data) {
            log("preload finished", data);
            slideshow.load();
          }
        });
      } else {
        slideshow.load();
      }
    })
    ;

    return self;
  };

  $.fn.unsupersized = function() {
    var self = this, buttons = self.buttons;
    self.slideshow.stopInterval();
    if (buttons.pause) $(buttons.pause).die();
    if (buttons.prev) $(buttons.prev).die();
    if (buttons.next) $(buttons.next).die();
    return self.unbind().die().undelegate();
  };

  $.fn.resizeImage = function(options) {
    // use supersized defaults unless explicit override
    options = $.extend({}, $.fn.supersized.defaults, options);

    var resize = function() {
      var $browser      = $.fn.supersized.browser,
          givenWidth    = options.width  || $browser.width(),
          givenHeight   = options.height || $browser.height(),
          $img          = $(this),
          imageWidth    = $img.attr('naturalWidth')   || $img.data('naturalWidth')    || ensureNaturalDimension(this, 'Width'),
          imageHeight   = $img.attr('naturalHeight')  || $img.data('naturalHeight')   || ensureNaturalDimension(this, 'Height'),
          imageRatio    = imageHeight / imageWidth,
          givenRatio    = givenHeight / givenWidth;

      if (givenRatio > imageRatio && options.crop) {
        $img.height(givenHeight);
        $img.width(givenHeight / imageRatio);
      } else {
        $img.width(givenWidth);
        $img.height(givenWidth * imageRatio);
      }

      if (options.center) {
        $img.css('left', ((givenWidth - $(this).width()) / 2) + 'px');
        $img.css('top', ((givenHeight - $(this).height()) / 2) + 'px');
      }
    },

    // necessary for IE
    ensureNaturalDimension = function(img, dimension) {
      var $img = $(img);

      // ensure natural height and width set
      $img.height("auto");
      $img.width("auto");

      return $img.data('natural' + dimension, $img[dimension.toLowerCase()]()).data('natural' + dimension);
    };

    this.each(resize);
    return this;
  };

  var CURRENT_SLIDE = 'ss_current_slide',

  proto = 'prototype',

  log = function() {
    if (window.console && window.console.log && window.console.log.apply) window.console.log.apply(window.console, arguments);
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
  },

  Slideshow = function(el, opts) {
    this.el         = el;
    this.$el        = $(el);
    this.opts       = opts || {};
    this.paused     = false;
    this.animating  = false;
    this.intervalId = null;
  };

  Slideshow[proto] = {
    load: function() {
      var self = this, opts = self.opts, $el = self.$el;

      if ($el.data("supersized")) return;

      $el.data("supersized", true);
      log("supersizing....");

      self.resize();
      self.showSlide(0, opts.transition, opts.duration);
      if (opts.playSlides) self.play();
      if (typeof opts.load == 'function') opts.load.call(this);
      if (_ && _.defer) {
        _.defer(function() {
          self.$el.trigger('resize.super');
        });
      }
    },

    play: function(trigger) {
      var self = this, el = self.el, $el = self.$el, opts = self.opts;
      if (typeof opts.play == 'function') opts.play.call(el, trigger);
      self.startInterval(opts);
      self.paused = false;
    },

    pause: function(trigger) {
      var self = this, el = self.el, $el = self.$el, opts = self.opts;
      if (typeof opts.pause == 'function') opts.pause.call(el, trigger);
      self.stopInterval();
      self.paused = true;
    },

    isPaused: function() {
      return this.paused;
    },

    nextSlide: function(transition, duration){
      var self = this,
          next = indexOfCurrentSlide.call(self.el) + 1;
      log("nextslide.super", next, "waiting:", this.animating, "transition:", transition);
      self.showSlide(next, transition, duration);
      self.$el.trigger("onnextslide.super");
      return self;
    },

    prevSlide: function(transition, duration) {
      var self = this,
          next = indexOfCurrentSlide.call(self.el) - 1;
      log("prevslide.super", next, "waiting", this.animating, "transition:", transition);
      self.showSlide(next, transition, duration);
      self.$el.trigger("onprevslide.super");
      return self;
    },

    showSlide: function(index, transition, duration) {
      index       = index || null;
      transition  = transition || false;
      var self = this, $el = self.$el,
          $children = $el.children(),
          total = $children.size(),
          $current = $el.children("." + CURRENT_SLIDE),
          duration = duration || $.fn.supersized.defaults.duration,
          $next, onShowComplete;

      if (self.animating) return;
      self.animating = transition;

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
        "z-index": self.opts.zIndex
      });

      onShowComplete = function() {
        var text = getCaption($next);
        log("showslide.super", text, index, total, transition);
        $current.css("z-index", -1);
        $next.css("opacity", 1);
        self.animating = false;
        self.resize();
        $el.trigger("onchange.super", {
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
      return self;
    },

    resize: function(img) {
      var self  = this,
          $el   = self.$el,
          $img  = (img ? $(img) : $el.find('img')),
          $browser      = $.fn.supersized.browser,
          browserWidth  = $browser.width(),
          browserHeight = $browser.height();
      log("resizing", browserWidth, browserHeight);
      $el.height(browserHeight);
      $el.width(browserWidth);
      $img.resizeImage(self.opts).trigger("resizing.super");
      $el.trigger("onresize.super");
      if (typeof self.opts.resize == 'function') self.opts.resize.call(self);
    },

    startInterval: function() {
      var self = this;
      if (self.intervalId) clearInterval(self.intervalId);

      self.intervalId = setInterval(function() {
          self.nextSlide();
        }, self.opts.interval);

      self.$el.trigger("intervalstarted.super");
      return self;
    },

    stopInterval: function() {
      var self = this;
      if (self.intervalId) clearInterval(self.intervalId);
      self.$el.trigger("intervalstopped.super");
      return self;
    },

    restartInterval: function() {
      var self = this;
      self.stopInterval().startInterval();
      return self;
    }

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
    zIndex      : 2,
    playSlides  : true,
    init        : emptyFunction,
    load        : emptyFunction,
    onchange    : emptyFunction,
    pause       : emptyFunction,
    play        : emptyFunction
  };

  $.fn.supersized.version = "3.1";

  $.fn.supersized.browser = $(window);

})(jQuery);