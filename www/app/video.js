function VideoPlayer() {
};

/**
 * Starts the video player intent
 *
 * @param url           The url to play
 */
VideoPlayer.prototype.play = function(url) {
    PhoneGap.exec(null, null, "VideoPlayer", "playVideo", [url]);
};

/**
 * Load VideoPlayer
 */
PhoneGap.addConstructor(function() {
    PhoneGap.addPlugin("videoPlayer", new VideoPlayer());
});

