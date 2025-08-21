import { useState, useRef, useEffect } from 'react';
import { uploadImage } from '../api/backend';
import { FiCamera, FiUpload, FiCameraOff, FiRotateCw } from 'react-icons/fi';

export default function ImageUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'camera'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const getCurrentPosition = () => new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
      setNote('Camera is ready. Click capture to take a photo.');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setNote('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob and create file
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
        setFile(file);
        setCapturedImage(canvas.toDataURL('image/jpeg'));
        setNote('Photo captured! Click upload to save.');
      }, 'image/jpeg', 0.9);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setFile(null);
    setNote('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setNote('⚠️ Please select an image to upload.')
      return
    }

    setLoading(true)
    setNote('Preparing upload...')
    
    try {
      // Create form data with the image
      const formData = new FormData()
      formData.append('image', file)

      // Get current location if available and add as fallback
      try {
        setNote('Getting your location...')
        const { lat, lng } = await getCurrentPosition()
        // console.log('Device location:', { lat, lng })
        
        // Add device location as fallback if EXIF doesn't have it
        formData.append('deviceLat', lat)
        formData.append('deviceLng', lng)
      } catch (geoErr) {
        console.warn('Geolocation not available:', geoErr.message)
        // Not critical - we'll proceed without location
      }

      // Upload the image
      setNote('Uploading image...')
      const { data } = await uploadImage(formData)
      
      if (!data) {
        throw new Error('No response data received from server')
      }
      
      // Update parent component with the uploaded file data
      onUploaded?.(data)
      setNote('✅ Image uploaded successfully!')

      // Face recognition feature commented out for now
      // if (data.id || data._id) {
      //   const fileId = data.id || data._id
      //   try {
      //     setNote('Processing faces...')
      //     const res = await recognizeFace(fileId)
      //     onRecognized?.(res.data)
      //   } catch (recErr) {
      //     console.log('Face recognition not available:', recErr.message)
      //     // Don't show error to user, just log it
      //   }
      // }
    } catch (err) {
      console.error(err)
      setNote('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg shadow bg-white overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('upload')}
        >
          <FiUpload className="inline-block mr-2" />
          Upload
        </button>
        <button
          type="button"
          className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'camera' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('camera')}
        >
          <FiCamera className="inline-block mr-2" />
          Camera
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'upload' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex justify-center text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setNote('');
                    }} 
                    className="sr-only" 
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
              {file && (
                <p className="mt-2 text-sm text-gray-900">
                  Selected: {file.name}
                </p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={!file || loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FiRotateCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : 'Upload'}
              </button>
              
              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setNote('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full ${cameraActive ? 'block' : 'hidden'}`}
                  />
                  {!cameraActive && (
                    <div className="aspect-video bg-gray-800 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiCamera className="mr-2 h-4 w-4" />
                        Start Camera
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-auto"
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex justify-center space-x-4">
              {cameraActive && !capturedImage && (
                <button
                  type="button"
                  onClick={captureImage}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiCamera className="mr-2 h-4 w-4" />
                  Capture
                </button>
              )}

              {capturedImage ? (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <FiRotateCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Uploading...
                      </>
                    ) : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={resetCapture}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Retake
                  </button>
                </>
              ) : null}

              {cameraActive && (
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setNote('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiCameraOff className="mr-2 h-4 w-4" />
                  Stop Camera
                </button>
              )}
            </div>
          </div>
        )}

        {note && (
          <p className={`mt-3 text-sm ${
            note.includes('success') ? 'text-green-600' : 
            note.includes('error') ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {note}
          </p>
        )}
      </div>
    </div>
  )
}