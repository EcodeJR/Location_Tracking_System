import os
from flask import Flask, request, jsonify
from utils.mongo import get_file_by_id
from utils.face_utils import get_face_encodings_from_bytes, compare_embeddings, score_from_distance
from models.enrollment_model import enroll_user, get_embeddings_and_userids

THRESHOLD = float(os.environ.get('THRESHOLD', 0.6))

app = Flask(__name__)

@app.route('/')
def index():
    return jsonify({'message': 'Face recognition service running'})


@app.route('/recognize', methods=['POST'])
def recognize():
    """
    Accepts JSON: { fileId: '<gridfs-objectid>' }
    OR accepts multipart/form-data with 'image' file.

    Returns: [{ userId: '...', confidence: 0.95 }, ...] or [] if no match
    """
    data = None
    # 1) if multipart file
    if 'image' in request.files:
        file = request.files['image']
        data = file.read()
    else:
        payload = request.get_json(force=True, silent=True) or {}
        file_id = payload.get('fileId')
        if not file_id:
            return jsonify({'error': 'fileId or image required'}), 400
        fetched = get_file_by_id(file_id)
        if not fetched:
            return jsonify({'error': 'file not found in GridFS'}), 404
        data, filename = fetched

    # compute encodings
    locations, encodings = get_face_encodings_from_bytes(data)
    if not encodings:
        return jsonify({'matches': [], 'faces': 0})

    # load enrolled embeddings
    user_ids, known_embeddings = get_embeddings_and_userids()

    results = []
    for enc in encodings:
        if not known_embeddings:
            continue
        dists = compare_embeddings(known_embeddings, enc)
        best_idx = int(dists.argmin())
        best_dist = float(dists[best_idx])
        if best_dist <= THRESHOLD:
            confidence = float(score_from_distance(best_dist, THRESHOLD))
            results.append({'userId': user_ids[best_idx], 'confidence': confidence})

    return jsonify({'matches': results, 'faces': len(encodings)})


@app.route('/enroll', methods=['POST'])
def enroll():
    """
    Enroll a user with an image. Accepts form-data: userId, image (file) OR JSON { userId, fileId }
    Returns enrollment id.
    """
    user_id = None
    embedding = None

    if 'image' in request.files and request.form.get('userId'):
        user_id = request.form.get('userId')
        data = request.files['image'].read()
        _, encs = get_face_encodings_from_bytes(data)
        if not encs:
            return jsonify({'error': 'No face found in image'}), 400
        embedding = encs[0].tolist()
    else:
        payload = request.get_json(force=True, silent=True) or {}
        user_id = payload.get('userId')
        file_id = payload.get('fileId')
        if not user_id or not file_id:
            return jsonify({'error': 'userId and fileId required'}), 400
        fetched = get_file_by_id(file_id)
        if not fetched:
            return jsonify({'error': 'file not found'}), 404
        data, _ = fetched
        _, encs = get_face_encodings_from_bytes(data)
        if not encs:
            return jsonify({'error': 'No face found in image'}), 400
        embedding = encs[0].tolist()

    eid = enroll_user(user_id, embedding)
    return jsonify({'enrollmentId': eid})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)