import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserImages, deleteImage } from '../api/backend';
import { toast } from 'react-toastify';
import { FiTrash2, FiMapPin, FiImage, FiRefreshCw, FiAlertCircle, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// Loading skeleton component
const SkeletonCard = () => (
  <div className="border rounded-lg overflow-hidden shadow-md bg-white">
    <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
    <div className="p-3">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
      <div className="flex justify-between mt-3">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

export default function ImageGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadImages = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await getUserImages();
        const { data } = response;
        
        if (!Array.isArray(data)) {
          throw new Error('Expected an array of images but received: ' + JSON.stringify(data));
        }
        
        setImages(data);
      } catch (err) {
        console.error('Error loading images:', err);
        setError('Failed to load images. Please try again later.');
        toast.error('Failed to load images');
      } finally {
        setLoading(false);
      }
    };
    
    loadImages();
  }, []);

  const handleImageError = (e, imageId) => {
    console.error(`Error loading image ${imageId}:`, e);
    setImages(prevImages => 
      prevImages.map(img => 
        img._id === imageId 
          ? { ...img, hasError: true, error: 'Failed to load image' } 
          : img
      )
    );
  };

  const handleLocate = (image) => {
    if (image.location?.coordinates) {
      navigate('/dashboard', { 
        state: { 
          center: { 
            lat: image.location.coordinates[1], 
            lng: image.location.coordinates[0] 
          } 
        } 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeletingId(id);
      const response = await deleteImage(id);
      
      if (response.data?.success) {
        setImages(images.filter(img => img._id !== id));
        toast.success('Image deleted successfully');
      } else {
        throw new Error(response.data?.message || 'Failed to delete image');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error(err.response?.data?.message || 'Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (loading && images.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Uploaded Images</h1>
          <button 
            disabled
            className="px-4 py-2 text-gray-400 bg-gray-100 rounded-md flex items-center"
          >
            <FiRefreshCw className="animate-spin mr-2" />
            Loading...
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-600"
              >
                <FiRefreshCw className="mr-1 h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Uploaded Images</h1>
          <p className="text-sm text-gray-500 mt-1">
            {images.length} {images.length === 1 ? 'image' : 'images'} in your collection
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 sm:mt-0 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
        >
          <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <AnimatePresence>
        {images.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-4">
              <FiImage className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No images found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first image with location data.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload Image
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {images.map((image) => {
              const imageId = image._id || '';
              const isValidId = /^[0-9a-fA-F]{24}$/.test(imageId);
              const imageUrl = isValidId ? image.imageUrl : `#invalid-id-${imageId}`;

              return (
                <motion.div 
                  key={image._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden group">
                    {!isValidId || image.hasError ? (
                      <div className="p-4 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-500 mb-2">
                          <FiAlertCircle className="h-6 w-6" />
                        </div>
                        <div className="text-red-600 text-sm font-medium">
                          {!isValidId ? 'Invalid Image' : 'Failed to load'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {imageId ? `ID: ${imageId.substring(0, 8)}...` : 'No ID'}
                        </div>
                        {image.error && (
                          <div className="text-xs text-red-500 mt-1 break-all max-w-xs">
                            {image.error}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={imageUrl}
                          alt={image.name || 'Uploaded image'}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => handleImageError(e, image._id)}
                          loading="lazy"
                        />
                        {image.location?.coordinates && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            <FiMapPin className="mr-1" />
                            Located
                          </div>
                        )}
                        {image.createdAt && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-xs">
                            <div className="flex items-center">
                              <FiClock className="mr-1" />
                              {new Date(image.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate" title={image.filename || 'Unnamed Image'}>
                          {image.filename || 'Unnamed Image'}
                        </p>
                        {image.metadata?.size && (
                          <p className="text-xs text-gray-500">
                            {Math.round(image.metadata.size / 1024)} KB
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLocate(image);
                          }}
                          disabled={!image.location?.coordinates}
                          className={`p-2 rounded-full transition-colors ${
                            image.location?.coordinates 
                              ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700' 
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={image.location?.coordinates ? 'View on map' : 'No location data'}
                        >
                          <FiMapPin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(image._id);
                          }}
                          disabled={deletingId === image._id}
                          className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full transition-colors"
                          title="Delete image"
                        >
                          {deletingId === image._id ? (
                            <FiRefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <FiTrash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
