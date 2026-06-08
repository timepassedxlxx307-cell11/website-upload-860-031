(function () {
    const scripts = document.querySelectorAll('script[data-video]');
    const script = scripts[scripts.length - 1];
    const video = document.getElementById('movie-player');
    const trigger = document.getElementById('play-trigger');
    const src = script ? script.getAttribute('data-video') : '';
    let attached = false;
    let hlsInstance = null;

    if (!video || !trigger || !src) {
        return;
    }

    function attachVideo() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
        } else {
            video.src = src;
        }
    }

    function startVideo() {
        attachVideo();
        trigger.classList.add('is-hidden');
        const request = video.play();
        if (request && typeof request.catch === 'function') {
            request.catch(function () {});
        }
    }

    trigger.addEventListener('click', startVideo);

    video.addEventListener('click', function () {
        if (!attached) {
            startVideo();
        }
    });

    video.addEventListener('play', function () {
        trigger.classList.add('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
