import uuid
from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_UPLOAD_BYTES = 5 * 1024 * 1024
ALLOWED_FORMATS = {'JPEG', 'PNG', 'WEBP'}
MAX_SIDE = 1600


class ImageRejected(ValueError):
    pass


def process_car_image(upload):
    """Validates an uploaded photo and returns a re-encoded JPEG with a random name.

    Re-encoding drops EXIF data (e.g. GPS position) and anything appended to the
    file, and the random name means the uploader never controls the stored path.
    """
    if upload.size > MAX_UPLOAD_BYTES:
        raise ImageRejected('The image is larger than 5 MB.')
    try:
        with Image.open(upload) as probe:
            probe.verify()
            image_format = probe.format
        upload.seek(0)
        image = Image.open(upload)
        image.load()
    except (UnidentifiedImageError, OSError, SyntaxError, ValueError, Image.DecompressionBombError):
        raise ImageRejected('The file is not a valid image.')
    if image_format not in ALLOWED_FORMATS:
        raise ImageRejected('Only JPEG, PNG and WebP images are allowed.')

    image = ImageOps.exif_transpose(image).convert('RGB')
    image.thumbnail((MAX_SIDE, MAX_SIDE))
    output = BytesIO()
    image.save(output, format='JPEG', quality=85, optimize=True)
    return ContentFile(output.getvalue(), name=f'{uuid.uuid4().hex}.jpg')
