/*global document,console */
(function (document) {
    "use strict";

    /**
     * Is the dom ready?
     *
     * Source: http://beeker.io/jquery-document-ready-equivalent-vanilla-javascript
     *
     * @param  Function callback The function to call when the dom is ready
     * @return void
     */
    function domReady(callback) {
        if (document.readyState === "interactive" || document.readyState === "complete") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    /**
     * Snif the userAgent to check if a device is a mobile.
     *
     * Adapted from: http://detectmobilebrowsers.com/
     *
     * @return Boolean
     */
    function isMobile() {
        var useragent = navigator.userAgent;

        if (useragent.match(/Android/i)) {
            return 'android';
        } else if (useragent.match(/webOS/i)) {
            return 'webos';
        } else if (useragent.match(/iPhone/i)) {
            return 'iphone';
        } else if (useragent.match(/iPod/i)) {
            return 'ipod';
        } else if (useragent.match(/iPad/i)) {
            return 'ipad';
        } else if (useragent.match(/Windows Phone/i)) {
            return 'windows phone';
        } else if (useragent.match(/SymbianOS/i)) {
            return 'symbian';
        } else if (useragent.match(/RIM/i) || useragent.match(/BB/i)) {
            return 'blackberry';
        } else {
            return false;
        }
        // var ua = navigator.userAgent || navigator.vendor || window.opera;
        // return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4)));
    }

    /**
     * Check if we're dealing with a retina device.
     *
     * Source: https://coderwall.com/p/q2z2uw/detect-hidpi-retina-displays-in-javascript
     *
     * @return Boolean
     */
    function isRetina() {
        var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';
        if (window.devicePixelRatio > 1){
            return true;
        }
        if (window.matchMedia && window.matchMedia(mediaQuery).matches){
            return true;
        }
        return false;
    }

    /**
     * Replace the element's innerHTML with a video based
     * on the element's data-embed-url attribute.
     *
     * @param  HTML Element element  The element in which to load the video
     * @param  Boolean autoPlay      Whether to autoplay the video (this won't work on mobil devices)
     * @return void
     */
    function loadVideoIntoElement(element, autoPlay) {
        var embedURL = element.getAttribute('data-embed-url');

        if (autoPlay) {
            embedURL = embedURL + '&autoplay=1';
        }

        // Ensure the element can only load once
        element.removeAttribute('data-embed-url');

        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        
        // Replace the elements content with the video iFrame
        element.innerHTML = '<iframe src="' + embedURL + '" width="100%" height="100%" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
    }

    /**
     * Load a video thumbnail into an element
     *
     * @param  HTML Element element  The element in which to load the video
     * @return void
     */
    function loadThumbnailIntoElement(element) {
        var thumbURL = isRetina() ? element.getAttribute('data-retina-thumb-url') : element.getAttribute('data-thumb-url'),
            img = new Image(),
            btn = document.createElement("span");

        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

        element.appendChild(img);

        img.onload = function () {
            // Remove the data attributes on load
            // to enable animations
            element.removeAttribute('data-thumb-url');
            element.removeAttribute('data-retina-thumb-url');
            element.appendChild(btn);
        };

        img.src = thumbURL;
    }

    /**
     * Live event binding
     *
     * Source: http://stackoverflow.com/a/25097561
     *
     * @param  string   eventType            The event type to capture
     * @param  string   elementQuerySelector The selector for the elements to capture the event on
     * @param  Function cb                   The callback function
     * @return void
     */
    function live(eventType, elementQuerySelector, cb) {
        document.addEventListener(eventType, function (event) {

            var qs = document.querySelectorAll(elementQuerySelector),
                el = event.target,
                index = -1;

            if (qs) {
                while (el && ((index = Array.prototype.indexOf.call(qs, el)) === -1)) {
                    el = el.parentElement;
                }

                if (index > -1) {
                    cb.call(el, event);
                }
            }
        });
    }

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     *
     * Source: https://davidwalsh.name/javascript-debounce-function
     *
     * @param  function func      the function to be executed
     * @param  int      wait      the debounce time in ms
     * @param  boolean  immediate whether to execute it immediately
     * @return function
     */
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    }

    /**
     * Is an element currently visible within the
     * browser window.
     *
     * Source: http://stackoverflow.com/a/15203639
     *
     * @param  HTML Element  el [description]
     * @return Boolean
     */
    function isElementVisible(element) {
        var rect = element.getBoundingClientRect(),
            vWidth = window.innerWidth || document.documentElement.clientWidth,
            vHeight = window.innerHeight || document.documentElement.clientHeight,
            efp = function (x, y) {
                return document.elementFromPoint(x, y);
            };

        // Return false if it's not in the viewport
        if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
            return false;
        }

        // Return true if any of its four corners are visible
        return (
            element.contains(efp(rect.left, rect.top)) || element.contains(efp(rect.right, rect.top)) || element.contains(efp(rect.right, rect.bottom)) || element.contains(efp(rect.left, rect.bottom))
        );
    }

    /**
     * Add click handlers to all elements with selector .flve-video[data-embed-url]
     *
     * @return void
     */
    function loadVideosOnClick() {
        var scrollHandler = debounce(function () {
            var videos = document.querySelectorAll('.flve-video[data-thumb-url]'),
                counter = videos.length - 1;

            for (counter; counter >= 0; counter = counter - 1) {
                if (isElementVisible(videos[counter])) {
                    loadThumbnailIntoElement(videos[counter], false);
                }
            }
        }, 250);

        window.addEventListener('DOMContentLoaded', scrollHandler, false);
        window.addEventListener('load', scrollHandler, false);
        window.addEventListener('scroll', scrollHandler, false);
        window.addEventListener('resize', scrollHandler, false);

        live('click', '.flve-video[data-embed-url]', function (element) {
            loadVideoIntoElement(this, true);
        });
    }

    /**
     * Add event handlers to detect when elements with selector .flve-video[data-embed-url]
     * or visible.
     *
     * @return void
     */
    function loadVideosOnScroll() {
        var scrollHandler = debounce(function () {
            var videos = document.querySelectorAll('.flve-video[data-embed-url]'),
                counter = videos.length - 1;

            for (counter; counter >= 0; counter = counter - 1) {
                if (isElementVisible(videos[counter])) {
                    loadVideoIntoElement(videos[counter], false);
                }
            }
        }, 250);

        window.addEventListener('DOMContentLoaded', scrollHandler, false);
        window.addEventListener('load', scrollHandler, false);
        window.addEventListener('scroll', scrollHandler, false);
        window.addEventListener('resize', scrollHandler, false);
    }

    /**
     * Init the events
     */
    if (isMobile()) {
        loadVideosOnScroll();
    } else {
        domReady(function () {
            loadVideosOnClick();
        });
    }

}(document));