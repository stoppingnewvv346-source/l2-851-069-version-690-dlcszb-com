(() => {
  const start = () => {
    const video = document.getElementById("videoPlayer");
    const button = document.getElementById("startPlayback");
    const streamUrl = window.__PLAYBACK_URL__;
    if (!video || !streamUrl) return;

    let attached = false;

    const attach = () => {
      if (attached) return;
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    const play = () => {
      attach();
      if (button) button.classList.add("is-hidden");
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          if (button) button.classList.remove("is-hidden");
        });
      }
    };

    if (button) button.addEventListener("click", play);
    video.addEventListener("click", () => {
      if (video.paused) play();
    });
  };

  document.addEventListener("DOMContentLoaded", start);
})();
