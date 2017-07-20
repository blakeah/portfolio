var APS = function()
{
    var me          = this;
    var handles     = [];
    var defaultStep = 0;

    var onScroll = function($e)
    {
        solveDefault();

        for (var i = 0; i < handles.length; i++) {
            scrollHandle(handles[i]);
        }
    };

    var solveDefault = function()
    {
        defaultStep = 1 / getDefaultEnd() * window.scrollY;
    };

    var getDefaultEnd = function()
    {
        return window.document.body.scrollHeight - window.innerHeight;
    };

    var solveStep = function(handle)
    {
        var step = 0;

        if (!handle.start && !handle.end) {
            step = defaultStep;
        } else {
            var start = 0, end = 0;

            if (handle.start) {
                start = handle.start.getPosition();
            } else {
                start = 0;
            }

            if (handle.end) {
                end = handle.end.getPosition();
            } else {
                end = getDefaultEnd();
            }

            var diff  = end - start ;
            step      = 1 / diff * (window.scrollY - start);
        }

        return step;
    };

    var scrollHandle = function(handle)
    {
        var step = solveStep(handle);

        if (step > 1) {
            if (handle.mode != APS.MODE_BOTTTOM) {
                handle.onScroll && handle.onScroll(1);
                handle.onModeChange && handle.onModeChange(APS.MODE_BOTTTOM, handle.mode);
                handle.mode = APS.MODE_BOTTTOM;
            }
        } else if (step < 0) {
            if (handle.mode != APS.MODE_TOP) {
                handle.onScroll && handle.onScroll(0);
                handle.onModeChange && handle.onModeChange(APS.MODE_TOP, handle.mode);
                handle.mode = APS.MODE_TOP;
            }
        } else {
            if (handle.mode != APS.MODE_PROGRESS) {
                handle.onModeChange && handle.onModeChange(APS.MODE_PROGRESS, handle.mode);
                handle.mode = APS.MODE_PROGRESS;
            }

            handle.onScroll && handle.onScroll(step);
        }


    };

    this.add = function(handle)
    {
        handle.mode = APS.MODE_TOP;
        handle.onModeChange && handle.onModeChange(APS.MODE_TOP, null);

        handles.push(handle);
        scrollHandle(handle);

        return me;
    };

    this.touch = onScroll;

    //init
    $(document).scroll(onScroll);
};

APS.MODE_TOP      = 1;
APS.MODE_PROGRESS = 2;
APS.MODE_BOTTTOM  = 3;

APS.location = {
    ViewBottom : function($ele, useBottom) {
        this.getPosition = function() {
            var pos = $ele.offset().top - window.innerHeight;

            if (useBottom) {
                pos += $ele.height();
            }

            return pos;
        }
    },
    ViewTop : function($ele, useBottom) {
        this.getPosition = function() {
            var pos = $ele.offset().top;

            if (useBottom) {
                pos += $ele.height();
            }

            return pos;
        }
    }
};

//LIB END



$(document.body).width(window.innerWidth + 20);


            var aps     = new APS();

            var $header  = $('.header');
            var $header2 = $('.header2');
            var $contentHeader = $('.content-header');
            var $outerScroll   = $('.scroll-outer');
            var $innerScroll   = $('.scroll-inner');

            var $carsBefore    = $('.cars-content');
            var $cars          = $('.cars > div');
            var $carP          = $cars.find('p');

            var small = function()
            {
                $innerScroll.stop().animate({
                    paddingLeft  : 2,
                    paddingRight : 2
                }, 300);
            };

            var goSmall = setTimeout(small, 1500);

            $(function () {
                $.srSmoothscroll({
                    ease: 'linear'
                });

                $(document.body).mousewheel(function() {
                    $innerScroll.stop().css('padding', '0 5px');
                    clearTimeout(goSmall);
                    goSmall = setTimeout(small, 1500);
                });
            });

            var scrollHeight = window.innerHeight * (window.innerHeight / document.body.scrollHeight);
            $innerScroll.height(scrollHeight);


            var showCars = function($car)
            {
                  if ($car.length) {
                      $car.animate({
                          opacity : 1
                      }, 300, function() {
                          showCars($car.next());
                      });
                  };
            };


            aps.add({
                onScroll : function(step) {
                    $innerScroll.css('margin-top', (window.innerHeight - scrollHeight) * step);
                }
            }).add({
                start    : new APS.location.ViewTop($header),
                end      : new APS.location.ViewTop($header, true),
                onScroll : function(step) {
                    $header.css('background-position', '50% ' + (100 - step * 100) + '%');
                },
                onModeChange : function(to, from)
                {
                    if (from == APS.MODE_PROGRESS && to == APS.MODE_BOTTTOM) {
                        $contentHeader.find('h1').animate({
                            opacity : 1
                        }, 300);
                    } else if (to == APS.MODE_PROGRESS && from == APS.MODE_BOTTTOM) {
                        $contentHeader.find('h1').animate({
                            opacity :.2
                        }, 300);
                    }

                }
            }).add({
                start    : new APS.location.ViewBottom($header2),
                end      : new APS.location.ViewTop($header2, true),
                onScroll : function(step) {
                    $header2.css('background-position', '50% ' + (100 - step * 100) + '%');
                }
            }).add({
                start : new APS.location.ViewTop($header2),
                end   : new APS.location.ViewTop($carsBefore, true),
                onScroll : function(step) {
                    $cars.eq(1).css('margin-top', 100 - step * 100);
                    $cars.eq(2).css('margin-top', 200 - step * 200);
                },
                onModeChange : function(to, from) {
                    if (to == APS.MODE_BOTTTOM) {
                        $carP.animate({
                            height : $carP.prop('scrollHeight')
                        }, 300);
                    } else if (to == APS.MODE_PROGRESS && from == APS.MODE_BOTTTOM) {
                        $carP.animate({
                            height : 100
                        }, 300);
                    }
                }
            });


            var textCb = function($ele)
            {
                aps.add({
                    start : {
                        getPosition : function() {
                            return $ele.offset().top - window.innerHeight / 2;
                        }
                    },
                    end : {
                        getPosition : function() {
                            return $ele.offset().top - window.innerHeight / 4;
                        }
                    },
                    onScroll : function(step) {
                        $ele.css('opacity', 0.2 + 1 / 0.8 * step);
                    }
                });
            };

            $('.text p').each(function(key, val) {
                textCb($(this));
            });


            var $end = $('#end');
            aps.add({
                start : {
                    getPosition : function() {
                        return $end.offset().top - window.innerHeight + 50;
                    }
                },
                end   : {
                    getPosition : function() {
                        return $end.offset().top - window.innerHeight + 200;
                    }
                },
                onScroll : function(step) {
                    $end.css('font-size', 10 + step * 50 + 'px');
                }
            });