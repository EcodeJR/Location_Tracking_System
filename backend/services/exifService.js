const exifParser = require('exif-parser');

function extractExif(buffer) {
  try {
    const parser = exifParser.create(buffer);
    const result = parser.parse();
    return result.tags || {};
  } catch (err) {
    return {};
  }
}

module.exports = { extractExif };