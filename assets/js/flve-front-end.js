/*!
 * fluid-lazy-video-embeds v0.1.1: Lazy load your YouTube and Vimeo videos and maintain their aspect ratio.
 * (c) 2016 
 * GPL-2.0 License
 * git+https://github.com/thuijssoon/fluid-lazy-video-embeds.git
 */

/*global jQuery,window */
/*jslint this:true,browser:true */
(function ($) {
    "use strict";

    function loadVideoIntoElement($element, autoPlay) {
        var embedURL = $element.attr('data-embed-url');
        if (autoPlay) {
            embedURL = embedURL + '&autoplay=1';
        }

        // Ensure the element can only load once
        $element.removeAttr('data-embed-url');

        // Replace the elements content with the video iFrame
        $element.html('<iframe src="' + embedURL + '" width="100%" height="100%" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
    }

    // Load videos marked to load always when the
    // entire page is loaded to make the page 'feel' faster
    $(window).load(function () {
        $('.flve-video.flve-load-always').each(function () {
            var $element = $(this);
            loadVideoIntoElement($element, false);
        });
    });

    $(document).on('click', '.flve-video[data-embed-url]', function (event) {
        event.preventDefault();
        var $element = $(this);
        loadVideoIntoElement($element, true);
    });

}(jQuery));