from pymongo import MongoClient
import os
from gridfs import GridFS
from bson import ObjectId

MONGO_URI = os.environ.get('MONGO_URI')
DB_NAME = os.environ.get('MONGO_DBNAME') or 'lastseen'

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
fs = GridFS(db, collection=os.environ.get('GRIDFS_BUCKET', 'uploads'))

def get_file_by_id(file_id):
    try:
        _id = ObjectId(file_id)
    except Exception:
        return None
    grid_out = fs.get(_id)
    data = grid_out.read()
    filename = grid_out.filename
    return data, filename

# enrollment collection will store documents like:
# { userId: ObjectId/string, embedding: [float,...], createdAt: datetime }
ENROLL_COLL = db[os.environ.get('ENROLL_COLLECTION', 'face_enrollments')]
