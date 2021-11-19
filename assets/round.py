from PIL import ImageDraw, Image
from PIL.Image import NEAREST


img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
draw.rounded_rectangle((0, 0, 32, 32), radius=16, fill="#E99F5A")

img = img.resize(512, 512, NEAREST)
img.save("level.png")