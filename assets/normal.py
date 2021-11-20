from PIL import Image
from PIL.Image import NEAREST


name = "npc_dota_hero_marci"
path = "./unknown (3).png"

img = Image.open(path)
img = img.resize((512, 512), NEAREST)
img.save(f"{name}.png")