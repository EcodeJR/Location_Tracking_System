// This module exposes helpers to interact with GridFS using the existing mongoose connection
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

let gfs;

function initGridFS() {
  const conn = mongoose.connection;
  Grid.mongo = mongoose.mongo;
  gfs = Grid(conn.db);
  gfs.collection('uploads');
}

function getGFS() {
  if (!gfs) initGridFS();
  return gfs;
}

module.exports = { initGridFS, getGFS };