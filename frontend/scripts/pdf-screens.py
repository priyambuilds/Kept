# Renders design/Design.pdf and crops every phone into artifacts/pdf/<id>.png (fidelity pass).
#   python3 frontend/scripts/pdf-screens.py
# Needs poppler (`brew install poppler`, for pdftoppm) and Pillow. The PDF is the screen book:
# a cover, then three phones per page in route order (routes.gen.json); the last page has two.
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.abspath(os.path.join(here, "../.."))
out = os.path.join(root, "artifacts/pdf")
DPI = 220
S = DPI / 110  # the boxes below were measured on a 110 dpi render

# Inner screen of each phone (bezel excluded), at 110 dpi.
TOP, BOTTOM = 96, 829
THREE = [(92, 431), (474, 813), (856, 1195)]
TWO = [(282, 621), (664, 1003)]


def main() -> None:
    routes = json.load(open(os.path.join(here, "../src/app/routes.gen.json")))
    ids = [r["id"] for r in routes]
    os.makedirs(out, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", str(DPI), "-png", os.path.join(root, "design/Design.pdf"), os.path.join(tmp, "p")], check=True)
        pages = sorted(f for f in os.listdir(tmp) if f.endswith(".png"))[1:]  # skip the cover
        mapping = {}
        i = 0
        for n, f in enumerate(pages, start=2):
            page = Image.open(os.path.join(tmp, f))
            boxes = TWO if len(ids) - i == 2 else THREE
            for x0, x1 in boxes:
                if i >= len(ids):
                    break
                crop = page.crop((int(x0 * S), int(TOP * S), int(x1 * S), int(BOTTOM * S)))
                crop = crop.resize((390, 844), Image.LANCZOS)
                crop.save(os.path.join(out, f"{ids[i]}.png"))
                mapping[ids[i]] = n
                i += 1
        if i != len(ids):
            sys.exit(f"mapped {i} of {len(ids)} screens; the PDF and routes.gen.json disagree")
        json.dump(mapping, open(os.path.join(out, "pages.json"), "w"), indent=1, ensure_ascii=False)
    print(f"wrote {len(ids)} screens to {out} (pages.json maps id → PDF page)")


main()
