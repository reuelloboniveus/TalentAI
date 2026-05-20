import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
import base64

PROJECT_ID = "prj-hrsaas-prod-firebase"
LOCATION = "us-central1"
vertexai.init(project=PROJECT_ID, location=LOCATION)

model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
images = model.generate_images(
    prompt="A test image of a futuristic city",
    number_of_images=1,
    aspect_ratio="1:1"
)
print("Image type:", type(images[0]))
if hasattr(images[0], '_image_bytes'):
    print("Has _image_bytes")
    # Base64 encode it
    encoded = base64.b64encode(images[0]._image_bytes).decode("utf-8")
    print("Base64 string length:", len(encoded))
