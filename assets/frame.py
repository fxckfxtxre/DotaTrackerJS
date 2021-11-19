import glob

from PIL import Image
from PIL import ImageDraw
from PIL.Image import NEAREST

index = 0
for path in glob.glob("./assets/icons/*.png"):
    img = Image.open(path)
    img = img.resize((384, 384), NEAREST)
    
    frame_img = Image.open("./assets/frame.png")
    frame_img.paste(img, (64, 64))

    name = path.replace("./assets/icons\\", "")
    frame_img.save(f"./assets/frame_icons/{name}")

    index += 1
    print(index)
    