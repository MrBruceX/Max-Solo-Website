/* ================= CONFIG — edit these ================= */
const CONFIG = {
  discordId: "824291204476567592",                 // your Discord user ID (or leave empty and type it on the page)
  leftImage: "",                 // URL of the art for the left card (empty = uses your avatar)
  socials: {                     // leave "" to hide an icon
    roblox:    "https://www.roblox.com/users/1064417608/profile",
    youtube:   "",
    tiktok:    "https://www.tiktok.com/@max.opti?_r=1&_t=ZS-9AYEuuozPxl",
    instagram: ""
  },
  music: {                       // background song (YouTube video)
    youtubeId: "NRcP9hcr-lg",
    title: "",                   // optional, empty = use the YouTube title
    artist: ""                   // optional, empty = use the YouTube channel name
  },
  refreshMs: 5000
};
/* ======================================================= */

const $ = id => document.getElementById(id);
const DISCORD_PATH = "M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z";
$("dcPath").setAttribute("d", DISCORD_PATH);

const ICONS = {
  roblox:    '<rect x="6" y="6" width="12" height="12" rx="2" transform="rotate(15 12 12)"/><rect x="10.5" y="10.5" width="3" height="3" transform="rotate(15 12 12)"/>',
  youtube:   '<rect x="3" y="6" width="18" height="12" rx="4"/><path d="M10 9.5v5l4.5-2.5z"/>',
  tiktok:    '<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.4 2.4 2 4 4.5 4.2"/>',
  instagram: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".6"/>'
};

// socials
Object.entries(CONFIG.socials).forEach(([k, url]) => {
  if (!url) return;
  const a = document.createElement("a");
  a.href = url; a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", k);
  a.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[k]}</svg>`;
  $("socials").appendChild(a);
});
if (!$("socials").children.length)
  ["roblox","youtube","tiktok","instagram"].forEach(k => {
    const a = document.createElement("a"); a.href = "#";
    a.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[k]}</svg>`; $("socials").appendChild(a);
  });

// waveform bars
for (let i = 0; i < 32; i++) {
  const b = document.createElement("i");
  b.style.setProperty("--h", (6 + Math.round(Math.abs(Math.sin(i * 1.7)) * 14)) + "px");
  b.style.setProperty("--d", (i % 8) * 0.12 + "s");
  $("wave").appendChild(b);
}

// ---- Discord profile ----
let timer = null, current = null;
const fmt = s => { s = Math.max(0, Math.floor(s / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

async function load(id) {
  try {
    const r = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error?.message || "User not found");
    return j.data;
  } catch (e) { throw e; }
}

function render(d) {
  const u = d.discord_user;
  const ext = u.avatar && u.avatar.startsWith("a_") ? "gif" : "png";
  const avatar = u.avatar
    ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=512`
    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(u.id) >> 22n) % 6}.png`;

  $("avatar").src = avatar;
  $("artImg").src = CONFIG.leftImage || avatar;
  $("name").textContent = u.global_name || u.display_name || u.username;
  $("handle").textContent = "@" + u.username;
  $("name").dataset.text = $("name").textContent;
  $("dot").className = "dot " + d.discord_status;
  $("dot").title = d.discord_status;

  // custom status (type 4)
  const cs = d.activities.find(a => a.type === 4);
  const emoji = cs?.emoji;
  const emojiHtml = emoji ? (emoji.id
    ? `<img src="https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}" alt="">`
    : emoji.name) : "";
  $("statusEmoji").innerHTML = emojiHtml;
  $("statusText").textContent = cs?.state || (d.discord_status === "offline" ? "offline" : "no status set");
  $("bubble").innerHTML = emojiHtml;
  $("bubble").classList.toggle("hidden", !emoji);

  if (CONFIG.music.youtubeId) { tick(); return; }

  // now playing: Spotify first, then any game/app
  const other = d.activities.find(a => a.type !== 4);
  current = null;
  if (d.listening_to_spotify && d.spotify) {
    const s = d.spotify;
    $("npLabel").textContent = "LISTENING";
    $("cover").src = s.album_art_url;
    $("npTitle").textContent = s.song;
    $("npSub").textContent = s.artist.replace(/;/g, ",");
    current = { start: s.timestamps.start, end: s.timestamps.end };
  } else if (other) {
    $("npLabel").textContent = "PLAYING";
    const img = other.assets?.large_image;
    $("cover").src = img ? (img.startsWith("mp:external/")
      ? "https://media.discordapp.net/external/" + img.slice(12)
      : `https://cdn.discordapp.com/app-assets/${other.application_id}/${img}.png`) : avatar;
    $("npTitle").textContent = other.name;
    $("npSub").textContent = [other.details, other.state].filter(Boolean).join(" | ") || "Live";
    current = other.timestamps?.start ? { start: other.timestamps.start, end: other.timestamps.end || null } : { live: true };
  } else {
    $("npLabel").textContent = "IDLE";
    $("cover").src = avatar;
    $("npTitle").textContent = "Nothing playing";
    $("npSub").textContent = "—";
  }
  $("wave").classList.toggle("on", !!current);
  tick();
}

function tick() {
  if (CONFIG.music.youtubeId) return ytTick();
  if (!current) { $("tNow").textContent = "0:00"; $("tEnd").textContent = "LIVE"; $("barFill").style.width = "0"; return; }
  const now = Date.now();
  if (current.start && current.end) {
    const total = current.end - current.start, el = Math.min(now - current.start, total);
    $("tNow").textContent = fmt(el); $("tEnd").textContent = fmt(total);
    $("barFill").style.width = (el / total * 100) + "%";
  } else {
    $("tNow").textContent = current.start ? fmt(now - current.start) : "0:00";
    $("tEnd").textContent = "LIVE"; $("barFill").style.width = "100%";
  }
}

/* ================= YouTube music ================= */
let yt = null, ytReady = false, started = false;
const MID = CONFIG.music.youtubeId;

if (MID) {
  $("cover").src = `https://i.ytimg.com/vi/${MID}/mqdefault.jpg`;
  $("npTitle").textContent = CONFIG.music.title || "Loading…";
  $("npSub").textContent = CONFIG.music.artist || "";
  const t = document.createElement("script");
  t.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(t);
}

window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player("ytPlayer", {
    width: 200, height: 200, videoId: MID,
    playerVars: { controls: 0, playsinline: 1, loop: 1, playlist: MID, rel: 0 },
    events: {
      onReady: () => {
        ytReady = true;
        yt.setVolume(60);
        const d = yt.getVideoData();
        if (!CONFIG.music.title) $("npTitle").textContent = d.title || "Unknown title";
        if (!CONFIG.music.artist) $("npSub").textContent = d.author || "";
        if (started) yt.playVideo();
      },
      onStateChange: e => setPlaying(e.data === YT.PlayerState.PLAYING)
    }
  });
};

function setPlaying(on) {
  $("wave").classList.toggle("on", on);
  document.querySelector(".right").classList.toggle("playing", on);
  $("npLabel").textContent = on ? "PLAYING" : (started ? "PAUSED" : "TAP TO PLAY");
  document.querySelector(".play svg").innerHTML = on
    ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>';
}

function ytTick() {
  if (!ytReady) return;
  const cur = yt.getCurrentTime() || 0, dur = yt.getDuration() || 0;
  $("tNow").textContent = fmt(cur * 1000);
  $("tEnd").textContent = dur ? fmt(dur * 1000) : "LIVE";
  $("barFill").style.width = dur ? (cur / dur * 100) + "%" : "0";
}

function togglePlay() {
  started = true;
  if (!ytReady) return;
  yt.getPlayerState() === YT.PlayerState.PLAYING ? yt.pauseVideo() : yt.playVideo();
}

if (MID) {
  setPlaying(false);
  const btns = document.querySelectorAll(".controls button");
  btns[0].onclick = () => ytReady && yt.seekTo(Math.max(0, yt.getCurrentTime() - 10), true);
  btns[1].onclick = e => { e.stopPropagation(); togglePlay(); };
  btns[2].onclick = () => ytReady && yt.seekTo(yt.getCurrentTime() + 10, true);

  const pct = (el, ev) => { const r = el.getBoundingClientRect(); return Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)); };
  $("progBar").onclick = e => ytReady && yt.seekTo(pct($("progBar"), e) * yt.getDuration(), true);
  $("volBar").onclick = e => { const v = pct($("volBar"), e); $("volFill").style.width = v * 100 + "%"; ytReady && yt.setVolume(v * 100); };

  // browsers block sound until the visitor interacts: first click anywhere starts the song
  document.addEventListener("click", () => {
    if (started) return;
    started = true;
    if (ytReady) yt.playVideo();
  }, { once: true, capture: true });

  setInterval(ytTick, 500);
}


/* ================= black bg: rising white dots ================= */
(function () {
  const cv = $("bg"), ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, dpr, mx = 0, my = 0, px = -999, py = -999;

  const mk = initial => ({
    x: Math.random() * W,
    y: initial ? Math.random() * H : H + 10 + Math.random() * 40,
    r: Math.random() * 1.9 + .5,
    v: Math.random() * .6 + .2,
    drift: Math.random() * 6.28,
    amp: Math.random() * .4 + .1,
    a: Math.random() * .6 + .3,
    tw: Math.random() * 6.28
  });
  let dots = [];

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(160, Math.max(50, W * H / 11000)));
    dots = Array.from({ length: n }, () => mk(true));
  }
  addEventListener("resize", resize); resize();

  const cards = document.querySelectorAll(".card"), stage = $("stage");
  addEventListener("pointermove", e => {
    px = e.clientX; py = e.clientY; mx = px / W * 2 - 1; my = py / H * 2 - 1;
    stage.style.setProperty("--mx", mx.toFixed(3)); stage.style.setProperty("--my", my.toFixed(3));
    cards.forEach(c => { const r = c.getBoundingClientRect();
      c.style.setProperty("--gx", (px - r.left) + "px"); c.style.setProperty("--gy", (py - r.top) + "px"); });
  });
  document.addEventListener("pointerleave", () => { px = py = -999; });

  let t = 0;
  function frame() {
    t += .02;
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      if (!reduce) {
        d.y -= d.v;
        d.x += Math.sin(t * .6 + d.drift) * d.amp * .5;
      }
      // cursor gently pushes dots away
      const dx = d.x - px, dy = d.y - py, dd = dx * dx + dy * dy;
      if (dd < 14400) { const l = Math.sqrt(dd) || 1, m = (1 - l / 120) * 1.6; d.x += dx / l * m; d.y += dy / l * m; }
      if (d.y < -10) Object.assign(d, mk(false));
      // fade in at the bottom, fade out near the top
      const fade = Math.min(1, Math.max(0, d.y / (H * .35))) * Math.min(1, (H - d.y + 20) / 80);
      const tw = .75 + .25 * Math.sin(t * 3 + d.tw);
      ctx.globalAlpha = d.a * fade * tw;
      ctx.shadowColor = "#fff"; ctx.shadowBlur = d.r * 5;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ================= start ================= */
(function () {
  const id = (CONFIG.discordId || "").trim();
  if (!/^\d{15,22}$/.test(id)) {
    $("name").textContent = "Your Name"; $("name").dataset.text = "Your Name";
    $("statusText").textContent = "Set discordId in script.js";
    return;
  }
  const poll = async () => {
    try { render(await load(id)); }
    catch (e) { $("statusText").textContent = "Join discord.gg/lanyard to show your status"; }
  };
  poll(); setInterval(poll, CONFIG.refreshMs);
})();