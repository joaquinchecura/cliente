from PIL import Image
import numpy as np
import os

OUTPUT_DIR = "public"
BG_COLOR = (5, 5, 8)

SIZES = {
    "favicon-16x16": (16, 16), "favicon-32x32": (32, 32),
    "favicon-48x48": (48, 48), "apple-touch-icon": (180, 180),
    "android-chrome-192x192": (192, 192), "android-chrome-512x512": (512, 512),
    "mstile-150x150": (150, 150), "og-image": (1200, 630),
    "twitter-card": (1200, 600), "logo-120x120": (120, 120),
    "logo-240x240": (240, 240), "logo-480x480": (480, 480),
}

def remove_bg(path):
    img = Image.open(path).convert("RGBA")
    arr = np.array(img)
    r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
    is_bg = (
        (np.abs(r.astype(int) - 246) < 8) &
        (np.abs(g.astype(int) - 253) < 8) &
        (np.abs(b.astype(int) - 247) < 8)
    ) | (
        (r > 240) & (g > 240) & (b > 240) &
        (np.abs(r.astype(int) - g.astype(int)) < 10) &
        (np.abs(g.astype(int) - b.astype(int)) < 10)
    )
    arr[is_bg] = [0, 0, 0, 0]
    return Image.fromarray(arr)

def generate(logo, prefix):
    ow, oh = logo.size
    os.makedirs(f"{OUTPUT_DIR}/{prefix}", exist_ok=True)
    for name, (w, h) in SIZES.items():
        c = Image.new("RGBA", (w, h), BG_COLOR + (255,))
        s = min(w * 0.7 / ow, h * 0.7 / oh)
        nw, nh = int(ow * s), int(oh * s)
        r = logo.resize((nw, nh), Image.LANCZOS)
        c.paste(r, ((w - nw) // 2, (h - nh) // 2), r)
        if name.startswith(("og", "twitter")):
            og = Image.new("RGBA", (w, h), BG_COLOR + (255,))
            a = np.array(og)
            for i in range(h):
                bl = (15 * (1 - i / h)) / 255
                a[i,:,0] = (16 * bl + BG_COLOR[0] * (1 - bl)).astype(np.uint8)
                a[i,:,1] = (185 * bl + BG_COLOR[1] * (1 - bl)).astype(np.uint8)
                a[i,:,2] = (129 * bl + BG_COLOR[2] * (1 - bl)).astype(np.uint8)
            og = Image.fromarray(a)
            og.paste(r, (w // 2 - nw // 2, h // 2 - nh // 2), r)
            c = og
        c.save(f"{OUTPUT_DIR}/{prefix}/{name}.png", "PNG", optimize=True)
        print(f"  ✓ {prefix}/{name}.png")
    imgs = []
    for iw, ih in [(16, 16), (32, 32), (48, 48)]:
        c = Image.new("RGBA", (iw, ih), BG_COLOR + (255,))
        s = min(iw * 0.7 / ow, ih * 0.7 / oh)
        nw, nh = int(ow * s), int(oh * s)
        r = logo.resize((nw, nh), Image.LANCZOS)
        c.paste(r, ((iw - nw) // 2, (ih - nh) // 2), r)
        imgs.append(c)
    imgs[0].save(f"{OUTPUT_DIR}/{prefix}/favicon.ico", format="ICO", sizes=[(16,16),(32,32),(48,48)], append_images=imgs[1:])
    print(f"  ✓ {prefix}/favicon.ico")

print("Generando MiPlan...")
generate(remove_bg("miplanlogo.png"), "miplan")
print("Generando Manager...")
generate(remove_bg("managerlogo.png"), "manager")
print("✅ Listo!")