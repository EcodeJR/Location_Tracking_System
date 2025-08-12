from datetime import datetime
from bson import ObjectId
from utils.mongo import ENROLL_COLL

# Helper CRUD functions

def enroll_user(user_id: str, embedding: list):
    doc = {
        'userId': user_id,
        'embedding': embedding,
        'createdAt': datetime.utcnow()
    }
    res = ENROLL_COLL.insert_one(doc)
    return str(res.inserted_id)


def get_all_enrollments():
    return list(ENROLL_COLL.find({}))


def get_embeddings_and_userids():
    docs = ENROLL_COLL.find({})
    user_ids = []
    embeddings = []
    for d in docs:
        user_ids.append(d.get('userId'))
        embeddings.append(d.get('embedding'))
    return user_ids, embeddings