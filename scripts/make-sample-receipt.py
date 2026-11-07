"""Deterministic synthetic receipt for vision testing; contains no personal data."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent.parent
image = Image.new('RGB', (760, 1220), '#fffefa')
draw = ImageDraw.Draw(image)
font_path = Path('C:/Windows/Fonts/consola.ttf')
bold_path = Path('C:/Windows/Fonts/consolab.ttf')
font = ImageFont.truetype(str(font_path), 26) if font_path.exists() else ImageFont.load_default(size=26)
small = ImageFont.truetype(str(font_path), 22) if font_path.exists() else ImageFont.load_default(size=22)
bold = ImageFont.truetype(str(bold_path), 36) if bold_path.exists() else ImageFont.load_default(size=36)
draw.text((380, 75), 'INGREDI DEMO MARKET', font=bold, fill='#292b29', anchor='mm')
draw.text((380, 123), 'SYNTHETIC RECEIPT / TEST DATA', font=small, fill='#555955', anchor='mm')
draw.text((55, 195), 'GROCERY PURCHASES', font=font, fill='#333833')
draw.line((55, 238, 705, 238), fill='#777b72', width=2)
rows = [
    ('ORG WHOLE MILK 1 GAL', '4.29'),
    ('CAGE FREE EGGS 12 CT', '3.49'),
    ('BNLS CHKN THGH 1.5 LB', '6.75'),
    ('BABY SPINACH 5 OZ', '2.99'),
    ('ROMA TOMATOES 4 CT', '2.40'),
    ('SHARP CHEDDAR 8 OZ', '3.79'),
    ('GRN ONI 2', '1.50'),
    ('PAPER TOWELS', '4.99'),
    ('DISH SOAP', '2.49'),
    ('TRASH BAGS', '3.99'),
]
y = 278
for name, price in rows:
    draw.text((55, y), name, font=font, fill='#303630')
    draw.text((705, y), price, font=font, fill='#303630', anchor='ra')
    y += 59
draw.line((55, y + 2, 705, y + 2), fill='#777b72', width=2)
for label, amount in [('SUBTOTAL', '36.68'), ('TAX', '0.00'), ('TOTAL', '36.68')]:
    y += 50
    draw.text((55, y), label, font=font, fill='#303630')
    draw.text((705, y), amount, font=font, fill='#303630', anchor='ra')
draw.text((380, 1140), 'Cook what you have.', font=small, fill='#555955', anchor='mm')
draw.text((380, 1175), 'No real transaction or personal data.', font=small, fill='#555955', anchor='mm')
image.save(root / 'public' / 'sample-receipt.png')
print('Created public/sample-receipt.png (synthetic fixture).')
