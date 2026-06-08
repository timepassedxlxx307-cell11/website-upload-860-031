function initMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay || !source) {
    return;
  }
  var attached = false;
  var hlsInstance = null;

  function attachMedia() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlayback() {
    attachMedia();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var request = video.play();
    if (request && typeof request.catch === "function") {
      request.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
