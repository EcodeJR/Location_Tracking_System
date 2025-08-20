import { useEffect, useState, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import MapView from '../components/MapView';
import { myImages } from '../api/backend';
import { FiMapPin, FiImage, FiUpload, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import { AuthCtx } from '../context/authContextStore';

export default function Dashboard() {
  const [points, setPoints] = useState([]);
  const [matches, setMatches] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [centerView, setCenterView] = useState(null);
  const location = useLocation();
  const { user } = useContext(AuthCtx);
  const userName = user?.name || '';

  // Handle location state for centering the map
  useEffect(() => {
    if (location.state?.center) {
      setCenterView(location.state.center);
      // Clear the location state to prevent re-centering on re-renders
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await myImages()
        // Transform the data to match what MapView expects
        const transformedData = (data || []).map(item => ({
          ...item,
          coords: item.location?.coordinates ? {
            lat: item.location.coordinates[1], // GeoJSON uses [lng, lat] order
            lng: item.location.coordinates[0]
          } : null
        })).sort((a, b) => new Date(b.createdAt || b.uploadDate) - new Date(a.createdAt || a.uploadDate));
        
        setPoints(transformedData);
      } catch (e) {
        console.error('Error loading images:', e);
      }
    })()
  }, [refresh])

  // Calculate statistics
  const totalImages = points.length;
  const lastUpload = points[0]?.createdAt || points[0]?.uploadDate;
  const locations = new Set(points.map(p => p.location ? `${p.location.coordinates[0]},${p.location.coordinates[1]}` : '').filter(Boolean));
  const uniqueLocations = locations.size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Location Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Track and manage your location history</p>
            </div>
            <Link 
              to="/gallery" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <FiImage className="mr-2 h-4 w-4" />
              View Image Gallery
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Message */}
        {userName && (
          <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiUser className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-900">Welcome back, {userName}!</h2>
                <p className="text-sm text-gray-600">You have {points.length} images in your collection across {uniqueLocations} locations.</p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Images Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <FiImage className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Images</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{totalImages}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Unique Locations Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FiMapPin className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Unique Locations</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{uniqueLocations}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Last Upload Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <FiClock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Last Upload</dt>
                    <dd className="text-sm text-gray-900">
                      {lastUpload ? new Date(lastUpload).toLocaleString() : 'No uploads yet'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Recognition Matches Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <FiUser className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Recognition Matches</dt>
                    <dd className="text-sm text-gray-900">
                      {matches?.matches?.length || 0} recent matches
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-blue-100 p-2 rounded-md">
                    <FiUpload className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="ml-3 text-lg font-medium text-gray-900">Upload New Image</h2>
                </div>
                <div className="mt-2">
                  <ImageUpload 
                    onUploaded={() => setRefresh((x) => x + 1)} 
                    onRecognized={setMatches} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Map View */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden h-full flex flex-col">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 bg-green-100 p-2 rounded-md">
                    <FiMapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <h2 className="ml-3 text-lg font-medium text-gray-900">Location History</h2>
                </div>
                <div className="mt-2 text-sm text-gray-500 mb-4">
                  Visual representation of your image upload locations. The most recent location is highlighted.
                </div>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
                  <MapView points={points} centerView={centerView} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recognition Results */}
        {matches && (
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-purple-100 p-2 rounded-md">
                  <FiActivity className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-900">Recognition Results</h2>
              </div>
              
              {(!matches.matches || matches.matches.length === 0) ? (
                <div className="text-center py-4 text-gray-500">
                  No face matches found in the last upload.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {matches.matches.map((m, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {m.userId || 'Unknown User'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  m.confidence > 0.7 ? 'bg-green-500' : 
                                  m.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${m.confidence * 100}%` }}
                              ></div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {(m.confidence * 100).toFixed(1)}% confidence
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              m.confidence > 0.7 ? 'bg-green-100 text-green-800' : 
                              m.confidence > 0.4 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {m.confidence > 0.7 ? 'High' : m.confidence > 0.4 ? 'Medium' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}