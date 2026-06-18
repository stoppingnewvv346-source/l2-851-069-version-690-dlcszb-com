import { H as Hls } from "./hls.js";

export function setupPlayer(options) {
  var video = document.getElementById(options.videoId);
  var overlay = document.getElementById(options.overlayId);
  var hls = null;
  var ready = false;

  if (!video || !options.source) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = options.source;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(options.source);
      hls.attachMedia(video);
    } else {
      video.src = options.source;
    }
    ready = true;
  }

  function play() {
    attach();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    var task = video.play();
    if (task && typeof task.catch === "function") {
      task.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", play);
  }
  video.addEventListener("click", play, { once: true });
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
