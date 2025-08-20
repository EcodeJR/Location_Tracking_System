// This module exposes helpers to interact with GridFS using mongoose's connection
const mongoose = require('mongoose');

let gfs;
let bucket;

function initGridFS() {
  const conn = mongoose.connection;
  
  // Initialize GridFS bucket
  bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
    chunkSizeBytes: 1024 * 1024, // 1MB chunks
  });
  
  // For backward compatibility
  gfs = {
    bucket: bucket,
    // Add any other methods you might be using from gridfs-stream
  };
  
  return gfs;
}

function getBucket() {
  if (!bucket && mongoose.connection.readyState === 1) {
    return initGridFS().bucket;
  } else if (!bucket) {
    // If not connected, wait for connection
    return new Promise((resolve) => {
      mongoose.connection.once('connected', () => {
        resolve(initGridFS().bucket);
      });
    });
  }
  return bucket;
}

// For backward compatibility
const getGFS = () => {
  if (!gfs && mongoose.connection.readyState === 1) {
    return initGridFS();
  }
  return gfs || initGridFS();
};

// Initialize when DB is connected
if (mongoose.connection.readyState === 1) {
  initGridFS();
} else {
  mongoose.connection.once('connected', initGridFS);
}

module.exports = { 
  initGridFS, 
  getGFS, 
  getBucket 
};