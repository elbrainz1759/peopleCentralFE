from PIL import Image
import sys

def process_image(input_path, output_paths):
    try:
        img = Image.open(input_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        new_data = []
        # Remove black background
        for item in datas:
            # Check if the pixel is black (increasing threshold slightly to catch compression artifacts)
            if item[0] < 50 and item[1] < 50 and item[2] < 50:
                new_data.append((255, 255, 255, 0)) # Transparent
            else:
                new_data.append(item)

        img.putdata(new_data)
        
        # Crop to content (trim transparent borders)
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        # Save to all output paths
        for path in output_paths:
            img.save(path, "PNG")
            print(f"Saved to {path}")
            
    except Exception as e:
        print(f"Error processing image: {e}")

input_file = "public/images/logo/temp_logo.png"
output_files = [
    "public/images/logo/logo.png",
    "public/images/logo/logo-dark.png",
    "public/images/logo/logo-icon.png",
    "public/images/logo/auth-logo.png",
    "src/app/icon.png"
]

process_image(input_file, output_files)
