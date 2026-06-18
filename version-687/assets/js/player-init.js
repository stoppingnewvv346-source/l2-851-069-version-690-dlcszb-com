import { H as Hls } from "./player-dru42stk.js";

window.Hls = Hls;
window.dispatchEvent(new CustomEvent("hls-library-ready"));
