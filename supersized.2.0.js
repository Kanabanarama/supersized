/*
Supersized - Fullscreen Slideshow jQuery Plugin
By Sam Dunn (www.buildinternet.com // www.onemightyroar.com)
Version: supersized.2.0.js // Relase Date: 5/7/09
Website: www.buildinternet.com/project/supersized
Thanks to Aen for preloading, fade effect, & vertical centering
*/

 (function($) {

    //Resize image on ready or resize
    $.fn.supersized = function(opts) {
        opts = opts || {};
        $.inAnimation = false;
        $.paused = false;
        var options = $.extend($.fn.supersized.defaults, opts);

        return this.
        bind("load.supersized",
        function() {
            var $this = $(this);
            $this.fadeIn('fast');
            if (options.loading) $(options.loading).hide();
            if (options.content) $(options.content).show();
            if ($this.find('.activeslide').length == 0) $this.find('a:first').addClass('activeslide');
            if (options.captions) $(options.captions).html($this.find('.activeslide').find('img').attr('title'));
            $this.superresizenow();
            if (options.navigation) $(options.navigation).show();
            //Slideshow
            if (options.slideshow) {
                if (options.slide_counter) {
                    //Initiate slide counter if active
                    $(options.slide_counter).find('.slidenumber').html(1);
                    $(options.slide_counter).find('.totalslides').html($this.children().size());
                }
                slideshow_interval = setInterval(
                  function() {
                    $this.trigger("nextslide.supersized");
                },
                options.slide_interval);
                if (options.navigation) {
                    //Skip if no navigation
                    $(options.navigation + ' a').click(
                      function() {
                        $(this).blur();
                        return false;
                    });
                    //Slide Navigation
                    $(options.next).click(function() {
                        if ($.paused) return false;
                        if ($.inAnimation) return false;
                        clearInterval(slideshow_interval);
                        $this.trigger("nextslide.supersized");
                        slideshow_interval = setInterval(function() {
                            $this.trigger("nextslide.supersized");
                        },
                        options.slide_interval);
                        return false;
                    });
                    $(options.prev).click(function() {
                        if ($.paused) return false;
                        if ($.inAnimation) return false;
                        clearInterval(slideshow_interval);
                        $this.trigger("prevslide.supersized");
                        slideshow_interval = setInterval(function() {
                            $this.trigger("prevslide.supersized");
                        },
                        options.slide_interval);
                        return false;
                    });
                    $(options.next + ' img').hover(function() {
                        if ($.paused == true) return false;
                        $(this).attr("src", "/images/forward.gif");
                    },
                    function() {
                        if ($.paused == true) return false;
                        $(this).attr("src", "/images/forward_dull.gif");
                    });
                    $(options.prev + ' img').hover(function() {
                        if ($.paused == true) return false;
                        $(this).attr("src", "/images/back.gif");
                    },
                    function() {
                        if ($.paused == true) return false;
                        $(this).attr("src", "/images/back_dull.gif");
                    });

                    //Play/Pause Button
                    $(options.pause).
                      click(function() {
                        if ($.inAnimation) return false;
                        var src = ($(this).find('img').attr("src").match(/play.gif/)) ? "/images/pause.gif": "/images/play.gif";
                        if (src.match(/pause.gif/)) {
                            $(this).find('img').attr("src", "/images/play.gif");
                            $.paused = false;
                            slideshow_interval = setInterval(function() {
                                $this.trigger("nextslide.supersized");
                            },
                            options.slide_interval);
                        } else {
                            $(this).find('img').attr("src", "/images/pause.gif");
                            clearInterval(slideshow_interval);
                            $.paused = true;
                        }
                        $(this).find('img').attr("src", src);
                        return false;
                      }).
                      mouseover(function() {
                        var imagecheck = ($(this).find('img').attr("src").match(/play_dull.gif/));
                        if (imagecheck) {
                            $(this).find('img').attr("src", "/images/play.gif");
                        } else {
                            $(this).find('img').attr("src", "/images/pause.gif");
                        }
                      }).
                      mouseout(function() {
                        var imagecheck = ($(this).find('img').attr("src").match(/play.gif/));
                        if (imagecheck) {
                            $(this).find('img').attr("src", "/images/play_dull.gif");
                        } else {
                            $(this).find('img').attr("src", "/images/pause_dull.gif");
                        }
                        return false;
                    });
                }
            }
        }).

        bind("nextslide.supersized",
        function() {
          log("next slide");
          var $this = $(this);
          if ($.inAnimation) return false;
          else $.inAnimation = true;

          var $currentslide = $this.find('.activeslide');
          $currentslide.removeClass('activeslide');

          if ($currentslide.length == 0) $currentslide = $this.find('a:last');

          var $nextslide = $currentslide.next().length ? $currentslide.next() : $this.find('a:first');
          var $prevslide = $nextslide.prev().length ? $nextslide.prev() : $this.find('a:last');

          //Display slide counter
          if (options.slide_counter) {
              var slidecount = $(options.slide_counter).find('.slidenumber').html();
              $currentslide.next().length ? slidecount++ : slidecount = 1;
              $(options.slide_counter).find('.slidenumber').html(slidecount);
          }

          $('.prevslide').removeClass('prevslide');
          $prevslide.addClass('prevslide');

          //Captions require img in <a>
          if (options.captions) $(options.captions).html($nextslide.find('img').attr('title'));

          $nextslide.hide().addClass('activeslide');
          if (options.transition == 0) {
              $nextslide.show();
              $.inAnimation = false;
          }
          if (options.transition) {
              $nextslide.fadeIn(750,
              function() {
                  $.inAnimation = false;
              });
          }
          if (options.transition == 2) {
              $nextslide.show("slide", {
                  direction: "up"
              },
              'slow',
              function() {
                  $.inAnimation = false;
              });
          }
          if (options.transition == 3) {
              $nextslide.show("slide", {
                  direction: "right"
              },
              'slow',
              function() {
                  $.inAnimation = false;
              });
          }
          if (options.transition == 4) {
              $nextslide.show("slide", {
                  direction: "down"
              },
              'slow',
              function() {
                  $.inAnimation = false;
              });
          }
          if (options.transition == 5) {
              $nextslide.show("slide", {
                  direction: "left"
              },
              'slow',
              function() {
                  $.inAnimation = false;
              });
          }

          $this.superresizenow();
        }).

        bind("prevslide.supersized",
        function() {
          log("prev slide");
          var $this = $(this);
          if ($.inAnimation) return false;
          else $.inAnimation = true;
          var $currentslide = $this.find('.activeslide');
          $currentslide.removeClass('activeslide');

          if ($currentslide.length == 0) $currentslide = $this.find('a:first');

          var $nextslide = $currentslide.prev().length ? $currentslide.prev() : $this.find('a:last'),
          $prevslide = $nextslide.next().length ? $nextslide.next() : $this.find('a:first');

          //Display slide counter
          if (options.slide_counter) {
              var slidecount = $(options.slide_counter).find('.slidenumber').html();
              $currentslide.prev().length ? slidecount-- : slidecount = $this.children().size();
              $(options.slide_counter).find('.slidenumber').html(slidecount);
          }

          $('.prevslide').removeClass('prevslide');
          $prevslide.addClass('prevslide');

          //Captions require img in <a>
          if (options.captions) $(options.captions).html($nextslide.find('img').attr('title'));

          $nextslide.hide().addClass('activeslide');
          if (options.transition == 0) {
              $nextslide.show();
              $.inAnimation = false;
          }
          if (options.transition) {
              $nextslide.fadeIn(750,
              function() {
                  $.inAnimation = false;
              });
          }
          if (options.transition == 2) {
              $nextslide.show("slide", {
                  direction: "down"
              },
              'slow',
              function() {
                  $.inAnimation = false;
              });
          }
          if (options.transition == 3) {
              $nextslide.show("slide", {
                  direction: "left"
              },
              'slow',
              function() {
                  $.inAnimation = false;
              });
          }
          if (options.transition == 4) {
              $nextslide.show("slide", {
                  direction: "up"
              },
              'slow',
              function() {
                  $.inAnimation = false;
              });
          }
          if (options.transition == 5) {
              $nextslide.show("slide", {
                  direction: "right"
              },
              'slow',
              function() {
                  $.inAnimation = false;
              });
          }

          $this.superresizenow();
        }).

        each(function() {
            var $this = $(this);
            $(document).ready(function() {
                $this.superresizenow();
            });

            $(window).bind('load',
            function() {
                $this.trigger('load.supersized');
            });

            //Pause when hover on image
            $this.
              delegate("img", "mouseenter", function() {
                  if (options.slideshow && options.pause_hover) {
                      if (! ($.paused) && options.navigation) {
                          $(options.pause + ' > img').attr("src", "/images/pause.gif");
                          clearInterval(slideshow_interval);
                      }
                  }
                  original_title = $(this).find('img').attr("title");
                  if ($.inAnimation) return false;
                  else $(this).find('img').attr("title", "");
              }).
              delegate("img", "mouseleave", function() {
                var $img = $(this)
                  if (options.slideshow && options.pause_hover) {
                      if (! ($.paused) && options.navigation) {
                          $(options.pause + ' > img').attr("src", "/images/pause_dull.gif");
                          slideshow_interval = setInterval($nextslide, options.slide_interval);
                      }
                  }
                  $(this).find('img').attr("title", original_title);
              });

            $(window).bind("resize",
            function() {
                $this.superresizenow();
            });

            $this.hide();
            $(options.content).hide();
        });

    };

    //Adjust image size
    $.fn.superresizenow = function(opts) {
        opts = opts || {};
        var options = $.extend($.fn.supersized.defaults, opts);
        return this.each(function() {
            var $this = $(this),
            $window = $(window),
            browserwidth = $window.width(),
            browserheight = $window.height();

            $this.height(browserheight);
            $this.width(browserwidth);

            $this.find('img').each(function() {
                var $img = $(this);
                //Gather browser and current image size
                var imagewidth = $img.attr('naturalWidth'),
                imageheight = $img.attr('naturalHeight');

                //Define image ratio
                var ratio = imageheight / imagewidth;

                //Resize image to proper ratio
                if (((browserheight / browserwidth) > ratio) == (options.crop === 1)) {
                    $img.height(browserheight);
                    $img.width(browserheight / ratio);
                } else {
                    $img.width(browserwidth);
                    $img.height(browserwidth * ratio);
                }

                if (options.vertical_center == 1) {
                    $img.css('left', (browserwidth - $(this).width()) / 2);
                    $img.css('top', (browserheight - $(this).height()) / 2);
                }
            });
            return false;
        });
    };

    $.fn.supersized.defaults = {
        vertical_center: 1,
        crop: 1,
        slideshow: 1,
        navigation: 1,
        transition: 1,
        //0-None, 1-Fade, 2-slide top, 3-slide right, 4-slide bottom, 5-slide left
        pause_hover: 0,
        slide_interval: 5000,

        loading: '#loading',
        content: '#content',
        captions: '#slidecaption',
        slide_counter: '#slidecounter',
        navigation: '#navigation',
        next: '#nextslide',
        prev: '#prevslide',
        pause: '#pauseplay'
    };

    function log() {
        if (window.console && window.console.log) window.console.log.apply(window.console, arguments);
    }

})(jQuery);