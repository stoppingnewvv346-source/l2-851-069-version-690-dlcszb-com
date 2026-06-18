(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

  players.forEach(function (root) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var streamUrl = root.getAttribute('data-stream');
    var initialized = false;
    var hlsInstance = null;

    function initialize() {
      if (!video || !streamUrl || initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function playVideo() {
      initialize();

      if (!video) {
        return;
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        root.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        root.classList.remove('is-playing');
      });

      video.addEventListener('ended', function () {
        root.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
