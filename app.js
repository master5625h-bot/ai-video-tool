/* BT Engine - frontend logic
   Backend = Hugging Face Space (Gradio API): Lightricks/ltx-video-distilled (free ZeroGPU).
   Engine swap = sirf CONFIG.space badlo. */
const CONFIG = {
  space: "Lightricks/ltx-video-distilled",
  apiName: "/text_to_video",
  cooldownMin: 10,      // 1 video per 10 min per user
  durationSec: 4        // 3-5 sec promise
};

const $ = id => document.getElementById(id);
const go = $("go"), statusEl = $("status"), bar = $("bar"), barfill = $("barfill");
const vid = $("vid"), resultCard = $("resultCard"), actions = $("actions"), dl = $("dl"), share = $("share");

document.querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => {
  $("prompt").value = c.textContent.replace(/^[^\s]+\s/, "");
  $("prompt").focus();
}));

const KEY = "avm_last";
function cooldownLeft() {
  const last = +localStorage.getItem(KEY) || 0;
  return Math.max(0, CONFIG.cooldownMin * 60 * 1000 - (Date.now() - last));
}
function tickCooldown() {
  const left = cooldownLeft();
  if (left > 0) {
    go.disabled = true;
    const m = Math.floor(left / 60000), s = Math.ceil((left % 60000) / 1000);
    go.innerHTML = `⏳ Agla video <span class="timer">${m}:${String(s).padStart(2, "0")}</span> min me`;
    setTimeout(tickCooldown, 1000);
  } else {
    go.disabled = false;
    go.textContent = "✨ Video Banao";
  }
}
tickCooldown();

function say(msg) { statusEl.innerHTML = msg; }
function progress(p) { bar.style.display = "block"; barfill.style.width = p + "%"; }

// Gradio Space API: POST /gradio_api/call/<api> -> event_id, then SSE stream
async function generate(prompt) {
  const host = "https://" + CONFIG.space.replace("/", "-") + ".hf.space";
  const base = host + "/gradio_api";
  const payload = [
    prompt,                                                            // prompt
    "worst quality, inconsistent motion, blurry, jittery, distorted",  // negative prompt
    "",                                                                // input image (none)
    "",                                                                // input video (none)
    512, 704,                                                          // height, width
    "text-to-video",                                                   // mode
    CONFIG.durationSec,                                                // duration sec
    9,                                                                 // frames from input video (unused)
    Math.floor(Math.random() * 1000000),                               // seed
    true,                                                              // randomize seed
    1,                                                                 // guidance scale
    true                                                               // improve texture
  ];
  const r = await fetch(base + "/call" + CONFIG.apiName, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload })
  });
  if (!r.ok) throw new Error("Engine busy hai, thodi der baad try karo");
  const { event_id } = await r.json();
  const res = await fetch(base + "/call" + CONFIG.apiName + "/" + event_id);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop();
    for (const line of lines) {
      if (line.startsWith("event: error")) throw new Error("Engine me dikkat aayi, dobara try karo");
      if (line.startsWith("data:")) {
        const payloadTxt = line.slice(5).trim();
        if (payloadTxt && payloadTxt !== "null") {
          const data = JSON.parse(payloadTxt);
          const v = Array.isArray(data) ? data[0] : data;
          if (v && v.video && v.video.url) return v.video.url;
          if (v && v.url) return v.url;
          if (v && v.path) return host + "/gradio_api/file=" + v.path;
          if (v && v.video && v.video.path) return host + "/gradio_api/file=" + v.video.path;
        }
      }
    }
  }
  throw new Error("Video nahi ban paya, dobara try karo");
}

go.addEventListener("click", async () => {
  const prompt = $("prompt").value.trim();
  if (prompt.length < 5) { say("⚠️ Thoda detail me likho (kam se kam 5 letters)"); return; }
  go.disabled = true;
  resultCard.style.display = "none";
  say("🔄 Engine ko bhej diya... queue me ho");
  progress(10);
  try {
    let p = 10;
    const iv = setInterval(() => { p = Math.min(90, p + 3); progress(p); say("🎬 Video ban raha hai... (1-5 min lag sakte hain)"); }, 4000);
    const url = await generate(prompt);
    clearInterval(iv);
    progress(100);
    vid.src = url;
    vid.style.display = "block";
    resultCard.style.display = "block";
    actions.style.display = "flex";
    dl.href = url;
    share.href = "https://wa.me/?text=" + encodeURIComponent("Maine AI se ye video banaya 🎬 " + url);
    say("✅ Ready! Neeche dekho");
    localStorage.setItem(KEY, Date.now());
  } catch (e) {
    say("❌ " + e.message);
    bar.style.display = "none";
  }
  tickCooldown();
});
