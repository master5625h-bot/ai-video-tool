# Permanent Engine Prep (Hugging Face ZeroGPU Space)

Bridge engine abhi: `Lightricks/ltx-video-distilled` (public Space, app.js CONFIG.space).
Apna permanent engine tab banega jab HF account 30 din purana ho jaye.

## Timeline
- Account banaya: ~2026-10-21 (dheerajhj42@gmail.com, vault: "Hugging Face dheerajhj42")
- ZeroGPU eligible: ~2026-11-20

## Swap steps (jab eligible ho)
1. huggingface.co pe login (vault se fill)
2. Kholo: https://huggingface.co/spaces/Lightricks/ltx-video-distilled -> "Duplicate this Space"
3. Hardware: ZeroGPU (free), visibility: Public
4. Build complete hone do (~10-20 min)
5. Repo `app.js` me CONFIG.space = "<username>/<space-name>" karke commit
6. Ek test generation live site pe

Fallback: agar duplicate ka option na ho, is folder ka `app.py` + `requirements.txt` naye Gradio Space me daal do (untested skeleton - build logs dekh ke fix karna hoga).

## Notes
- Free personal account = max 2 ZeroGPU Spaces
- Space idle pe sota hai; pehla request 1-2 min slow
- Koi secret code me nahi; HF token sirf zaroorat pade to vault se
