import numpy as np
import face_recognition

# compute embeddings from image bytes
from io import BytesIO
from PIL import Image

def load_image_from_bytes(data: bytes):
    img = Image.open(BytesIO(data)).convert('RGB')
    return np.array(img)


def get_face_encodings_from_bytes(data: bytes):
    img = load_image_from_bytes(data)
    # detect face locations and compute embeddings
    locations = face_recognition.face_locations(img)
    encodings = face_recognition.face_encodings(img, locations)
    return locations, encodings


def compare_embeddings(known_embeddings, query_embedding):
    # known_embeddings: list of [floats]
    # query_embedding: single vector
    dists = face_recognition.face_distance(known_embeddings, query_embedding)
    return dists


def score_from_distance(dist, threshold=0.6):
    # convert distance to confidence-like score (0..1)
    if dist >= threshold:
        return max(0.0, 1 - (dist - threshold))
    return 1.0 - (dist / threshold) * 0.5