const mongoose = require('mongoose');
const ImageMeta = require('../models/ImageMeta');
const User = require('../models/User');
const { extractExif } = require('../services/exifService');
const { recognizeFace } = require('../services/faceService');
const { getBucket } = require('../src/config/gridfs');

// Upload route uses multer-gridfs-storage; file available as req.file
async function uploadImage(req, res, next) {
  try {
    const file = req.file; // File from multer
    if (!file) {
      console.error('[ERROR] No file in upload request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('[DEBUG] Processing file upload:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer
    });

    // Get the GridFS bucket
    const bucket = await getBucket();
    if (!bucket) {
      console.error('[ERROR] Failed to initialize GridFS bucket for upload');
      return res.status(500).json({ message: 'Failed to initialize storage' });
    }
    
    // Extract EXIF data from the buffer
    let exif = {};
    try {
      exif = extractExif(file.buffer);
      console.log('[DEBUG] EXIF data extracted:', {
        hasGPS: !!(exif.GPSLatitude && exif.GPSLongitude),
        GPSLatitude: exif.GPSLatitude,
        GPSLongitude: exif.GPSLongitude,
        GPSLatitudeRef: exif.GPSLatitudeRef,
        GPSLongitudeRef: exif.GPSLongitudeRef,
        otherKeys: Object.keys(exif).filter(k => !k.startsWith('GPS') && k !== 'thumbnail')
      });
    } catch (exifErr) {
      console.warn('[WARN] Error extracting EXIF data:', exifErr.message);
    }

    // Initialize default location (null means no location)
    let location = null;
    
    // If EXIF has GPS data, process it
    if (exif.GPSLatitude && exif.GPSLongitude && 
        exif.GPSLatitudeRef && exif.GPSLongitudeRef) {
      try {
        const lat = gpsToDecimal(exif.GPSLatitude, exif.GPSLatitudeRef);
        const lon = gpsToDecimal(exif.GPSLongitude, exif.GPSLongitudeRef);
        
        // Only set location if we have valid coordinates
        if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
          location = { 
            type: 'Point', 
            coordinates: [lon, lat] // GeoJSON uses [longitude, latitude] order
          };
          console.log('[DEBUG] Extracted valid GPS location:', location);
        } else {
          console.warn('[WARN] Invalid GPS coordinates:', { lat, lon });
        }
      } catch (gpsErr) {
        console.warn('[WARN] Error processing GPS data:', gpsErr);
      }
    } else {
      console.log('[DEBUG] No GPS data found in EXIF or missing reference values');
    }

    // Check for device location as fallback if EXIF doesn't have it
    if ((!location || !location.coordinates) && (req.body.deviceLat && req.body.deviceLng)) {
      const lat = parseFloat(req.body.deviceLat);
      const lng = parseFloat(req.body.deviceLng);
      
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && 
          lng >= -180 && lng <= 180) {
        location = {
          type: 'Point',
          coordinates: [lng, lat] // GeoJSON uses [longitude, latitude]
        };
        console.log('[DEBUG] Using device location as fallback:', location);
      }
    }

    // Create the image metadata
    const imageData = {
      filename: file.originalname,
      uploader: req.user.id,
      exif,
      gridFsId: file.id || file._id,
      contentType: file.mimetype,
      size: file.size,
      uploadDate: new Date()
    };

    // Add location if available
    if (location?.coordinates?.length === 2 && 
        location.coordinates.every(coord => coord !== 0)) {
      imageData.location = location;
    }

    console.log('[DEBUG] Image metadata prepared:', {
      hasLocation: !!imageData.location,
      ...(imageData.location && { location: imageData.location }),
      gridFsId: file.id || file._id,
      size: file.size
    });

    const meta = new ImageMeta(imageData);

    // Save the metadata
    await meta.save();
    
    console.log('[DEBUG] Image metadata saved:', {
      fileId: file.id || file._id,
      metaId: meta._id,
      filename: file.originalname,
      size: file.size
    });

    // Face recognition feature commented out for now
    // if (process.env.FACE_SERVICE_URL && (file.id || file._id)) {
    //   try {
    //     const faces = await recognizeFace(file.id || file._id);
    //     if (faces && Array.isArray(faces) && faces.length > 0) {
    //       meta.detectedFaces = faces;
          
    //       // Update lastSeen for any matched users
    //       const updates = [];
    //       for (const f of faces) {
    //         if (f.userId) {
    //           updates.push(
    //             User.findByIdAndUpdate(f.userId, { 
    //               lastSeen: new Date(),
    //               lastLocation: meta.location,
    //               lastSeenInImage: meta._id
    //             }, { new: true })
    //           );
    //         }
    //       }
          
    //       // Wait for all updates to complete
    //       if (updates.length > 0) {
    //         await Promise.all(updates);
    //       }
    //     }
    //   } catch (faceErr) {
    //     console.error('Error in face recognition service:', faceErr);
    //     // Don't fail the upload if face recognition fails
    //   }
    // }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const response = {
      _id: meta._id,
      id: meta._id.toString(), // For backward compatibility
      filename: meta.filename,
      uploader: meta.uploader,
      uploadDate: meta.uploadDate,
      imageUrl: `${req.protocol}://${req.get('host')}/api/images/${meta._id}`,
      url: `${req.protocol}://${req.get('host')}/api/images/${meta._id}`, // For backward compatibility
      contentType: meta.contentType,
      size: meta.size
    };

    // Add location if available
    if (meta.location) {
      response.location = meta.location;
    }

    // Return the response
    res.status(201).json(response);

  } catch (err) {
    next(err);
  }
}

/**
 * Convert GPS coordinates from DMS (Degrees, Minutes, Seconds) to decimal degrees
 * @param {Array|Object} gpsArray - The GPS coordinate array [degrees, minutes, seconds] or {n, d} rational
 * @param {String} ref - The reference direction ('N', 'S', 'E', 'W')
 * @returns {Number} Decimal degrees
 */
function gpsToDecimal(gpsArray, ref) {
  try {
    if (!gpsArray) {
      console.log('[DEBUG] No GPS array provided');
      return null;
    }
    
    // Helper to convert rational numbers {n, d} to decimal
    const toDecimal = (value) => {
      if (typeof value === 'number') return value;
      if (value && typeof value === 'object' && 'n' in value && 'd' in value) {
        return value.n / value.d;
      }
      return 0;
    };

    // Handle different GPS array formats
    const deg = toDecimal(Array.isArray(gpsArray) ? gpsArray[0] : gpsArray);
    const min = toDecimal(Array.isArray(gpsArray) ? gpsArray[1] : 0);
    const sec = toDecimal(Array.isArray(gpsArray) ? gpsArray[2] : 0);
    
    // Calculate decimal degrees
    let decimal = deg + (min / 60) + (sec / 3600);
    
    // Apply direction (negative for S or W)
    if (ref === 'S' || ref === 'W') {
      decimal = -Math.abs(decimal);
    }
    
    console.log('[DEBUG] Converted GPS:', { 
      original: gpsArray, 
      ref, 
      components: { deg, min, sec },
      decimal 
    });
    
    return decimal;
  } catch (error) {
    console.error('[ERROR] Error in gpsToDecimal:', error);
    return null;
  }
}

// Stream image by ID
async function getImage(req, res, next) {
  try {
    const imageId = req.params.id;
    console.log(`[DEBUG] getImage - Request received for ID: ${imageId}`);
    
    // Check if this is a special route that should be handled by getMyImages
    if (imageId === 'my') {
      console.log('[DEBUG] getImage - Redirecting to getMyImages');
      return getMyImages(req, res, next);
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      console.error(`[ERROR] Invalid image ID format: ${imageId}`);
      return res.status(400).json({ 
        message: 'Invalid image ID format',
        receivedId: imageId,
        expectedFormat: 'MongoDB ObjectId'
      });
    }
    
    // Get the GridFS bucket
    const bucket = await getBucket();
    if (!bucket) {
      console.error('[ERROR] Failed to initialize GridFS bucket');
      return res.status(500).json({ message: 'Failed to initialize storage' });
    }
    
    // Find the image metadata first
    const imageMeta = await ImageMeta.findById(imageId);
    if (!imageMeta) {
      console.error(`[ERROR] Image meta not found for ID: ${imageId}`);
      return res.status(404).json({ 
        message: 'Image not found',
        imageId
      });
    }
    
    // Get the GridFS file ID from metadata
    if (!imageMeta.gridFsId) {
      console.error(`[ERROR] No gridFsId found in ImageMeta for ID: ${imageId}`);
      return res.status(500).json({ 
        message: 'Image data is corrupted',
        imageId,
        details: 'Missing GridFS reference'
      });
    }
    
    const gridFsId = new mongoose.Types.ObjectId(imageMeta.gridFsId);
    console.log(`[DEBUG] Found ImageMeta, looking for GridFS file with ID: ${gridFsId}`);
    
    // Check if file exists in GridFS
    const files = await bucket.find({ _id: gridFsId }).toArray();
    if (!files || files.length === 0) {
      console.error(`[ERROR] File not found in GridFS with ID: ${gridFsId}`);
      return res.status(404).json({ 
        message: 'Image data not found',
        imageId,
        gridFsId: gridFsId.toString(),
        filename: imageMeta.filename,
        details: 'The file metadata exists but the actual image data is missing from storage.'
      });
    }
    
    const fileDoc = files[0];
    console.log('[DEBUG] File metadata:', {
      filename: fileDoc.filename,
      length: fileDoc.length,
      uploadDate: fileDoc.uploadDate,
      contentType: fileDoc.contentType
    });
    
    const downloadStream = bucket.openDownloadStream(gridFsId);
    
    // Set appropriate headers
    res.set('Content-Type', fileDoc.contentType || 'image/jpeg');
    res.set('Content-Length', fileDoc.length);
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Handle stream errors
    downloadStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          message: 'Error streaming file',
          error: error.message,
          gridFsId: gridFsId.toString()
        });
      }
    });
    
    // Handle client disconnection
    req.on('close', () => {
      if (!res.headersSent) {
        downloadStream.destroy();
        console.log(`[DEBUG] Client disconnected while streaming file: ${gridFsId}`);
      }
    });
    
    // Pipe the file to response
    downloadStream.pipe(res);
    
  } catch (err) {
    console.error('Error in getImage:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
}

// Get all images for the current user
async function getMyImages(req, res, next) {
  try {
    console.log(`[DEBUG] Fetching images for user: ${req.user.id}`);
    
    // Find all images for the user, sorted by most recent first
    const images = await ImageMeta.find({ uploader: req.user.id })
      .sort({ uploadDate: -1 })
      .lean();
    
    // Add full URLs to each image
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const processedImages = images.map(img => {
      const imageUrl = `${baseUrl}/api/images/${img._id}`;
      
      return {
        ...img,
        // Ensure consistent ID field
        id: img._id.toString(),
        // Add both URL formats for compatibility
        imageUrl: imageUrl,
        url: imageUrl,
        // Add thumbnail URL (same as full image for now)
        thumbnailUrl: imageUrl,
        // Ensure location is properly formatted
        ...(img.location && {
          location: {
            type: img.location.type || 'Point',
            coordinates: img.location.coordinates || []
          }
        })
      };
    });
    
    console.log(`[DEBUG] Found ${processedImages.length} images for user`);
    res.json(processedImages);
    
  } catch (error) {
    console.error('Error fetching user images:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch user images',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Get all user images with location data
async function getUserImagesWithLocations(req, res, next) {
  try {
    console.log('[DEBUG] Fetching user images with locations for user:', req.user.id);
    
    const images = await ImageMeta.find({ 
      uploader: req.user.id,
      'location.coordinates': { $exists: true, $ne: null }
    })
    .select('_id filename uploadDate location caption')
    .sort({ uploadDate: -1 })
    .lean();

    console.log(`[DEBUG] Found ${images.length} images with location data`);
    
    // Add full image URLs with the correct base path and API prefix
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imagesWithUrls = images.map(img => {
      // Make sure to include the /api/images/ prefix in the URL
      const imageUrl = `${baseUrl}/api/images/${img._id}`;
      console.log(`[DEBUG] Generated URL for image ${img._id}: ${imageUrl}`);
      
      return {
        ...img,
        imageUrl,
        location: {
          type: img.location.type,
          coordinates: img.location.coordinates
        }
      };
    });

    console.log('[DEBUG] Sending images with URLs to client');
    res.json(imagesWithUrls);
  } catch (error) {
    console.error('Error fetching user images with locations:', error);
    next(error);
  }
}

// Delete an image by ID
async function deleteImage(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid image ID' });
    }

    // Find the image metadata
    const image = await ImageMeta.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Debug log for user ID comparison
    console.log('[DEBUG] Delete authorization check:', {
      imageUploader: image.uploader,
      imageUploaderType: typeof image.uploader,
      imageUploaderString: String(image.uploader),
      userId,
      userIdType: typeof userId,
      equalityCheck: image.uploader.toString() === userId.toString()
    });

    // Check if the user is authorized to delete this image
    if (image.uploader.toString() !== userId.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this image',
        debug: {
          imageUploader: image.uploader.toString(),
          userId: userId.toString(),
          types: {
            imageUploader: typeof image.uploader,
            userId: typeof userId
          }
        }
      });
    }

    // Get GridFS bucket
    const bucket = await getBucket();
    if (!bucket) {
      return res.status(500).json({ message: 'Failed to initialize storage' });
    }

    // Delete from GridFS
    if (image.gridFsId) {
      const fileId = new mongoose.Types.ObjectId(image.gridFsId);
      await bucket.delete(fileId);
    }

    // Delete the metadata
    await ImageMeta.findByIdAndDelete(id);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { 
  uploadImage, 
  getImage, 
  getMyImages, 
  getUserImagesWithLocations,
  deleteImage
};