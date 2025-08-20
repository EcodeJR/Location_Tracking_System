import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiCamera, FiMapPin, FiUpload, FiShield } from 'react-icons/fi';

const FeatureCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{children}</p>
  </div>
);

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Track Your Memories with Precision</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Capture, organize, and relive your moments with location-based photo management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    to="/gallery"
                    className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                  >
                    View Gallery
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your location-based photo collection
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={FiCamera} title="Easy Upload">
              Quickly upload your photos with automatic location tagging and EXIF data extraction.
            </FeatureCard>
            <FeatureCard icon={FiMapPin} title="Location Tracking">
              View your photos on an interactive map and see where each memory was captured.
            </FeatureCard>
            <FeatureCard icon={FiUpload} title="Cloud Storage">
              Your photos are safely stored in the cloud and accessible from any device.
            </FeatureCard>
            <FeatureCard icon={FiShield} title="Privacy First">
              Your data is encrypted and only you control who can see your photos and locations.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who are already organizing their memories with LastSeen.
          </p>
          <Link
            to={user ? "/gallery" : "/register"}
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            {user ? 'Go to My Gallery' : 'Create Free Account'}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="text-2xl font-bold">LastSeen</Link>
              <p className="text-gray-400 mt-2">Capture every moment, remember every place.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Terms
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} LastSeen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
