(function () {
    function loadStream(video, source) {
        if (!video || !source) {
            return null;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return null;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return hls;
        }
        video.src = source;
        return null;
    }

    window.initVideoPlayer = function (source) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("play-cover");
        var hlsInstance = null;
        var initialized = false;

        function ensureLoaded() {
            if (!initialized) {
                hlsInstance = loadStream(video, source);
                initialized = true;
            }
        }

        function play() {
            ensureLoaded();
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (!video) {
            return;
        }

        if (button) {
            button.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            ensureLoaded();
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };
})();
