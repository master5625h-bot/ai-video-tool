# ZeroGPU Space skeleton: LTX-Video text-to-video (UNTESTED - fix against current diffusers API at build time)
import spaces
import gradio as gr
import torch
from diffusers import LTXPipeline
from diffusers.utils import export_to_video

pipe = LTXPipeline.from_pretrained("Lightricks/LTX-Video", torch_dtype=torch.bfloat16)

@spaces.GPU
def generate(prompt, negative_prompt="worst quality, inconsistent motion, blurry, jittery, distorted",
             height=512, width=704, duration=4.0, seed=42):
    pipe.to("cuda")
    frames = max(9, int(duration * 24) + 1)
    video = pipe(prompt=prompt, negative_prompt=negative_prompt,
                 height=int(height), width=int(width), num_frames=frames,
                 generator=torch.Generator().manual_seed(int(seed))).frames[0]
    out = "/tmp/output.mp4"
    export_to_video(video, out, fps=24)
    return out

demo = gr.Interface(
    fn=generate,
    inputs=[gr.Textbox(label="Prompt"), gr.Textbox(label="Negative Prompt"),
            gr.Slider(256, 1280, value=512, label="Height"), gr.Slider(256, 1280, value=704, label="Width"),
            gr.Slider(0.3, 8.5, value=4.0, label="Video Duration (seconds)"), gr.Number(value=42, label="Seed")],
    outputs=gr.Video(label="Video"),
    title="BT Engine",
    api_name="text_to_video",
)
demo.queue().launch()
