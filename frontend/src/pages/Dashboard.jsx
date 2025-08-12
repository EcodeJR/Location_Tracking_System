import { useEffect, useState } from 'react'
import ImageUpload from '../components/ImageUpload'
import MapView from '../components/MapView'
import { myImages } from '../api/backend'

export default function Dashboard() {
  const [points, setPoints] = useState([])
  const [matches, setMatches] = useState(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await myImages()
        // Expecting each item: { _id, createdAt, coords: { lat, lng }, caption? }
        const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setPoints(sorted)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [refresh])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Upload new image</h2>
          <ImageUpload onUploaded={() => setRefresh((x) => x + 1)} onRecognized={setMatches} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Your last seen map</h2>
          <MapView points={points} />
          <div className="mt-2 text-sm text-gray-600">Markers show each image upload location. Latest marker centers the map.</div>
        </div>
      </div>
      {matches && (
        <div className="border rounded p-4 bg-white">
          <h3 className="font-semibold mb-2">Recognition Result</h3>
          {(!matches.matches || matches.matches.length === 0) ? (
            <p className="text-gray-600">No matches or service unavailable.</p>
          ) : (
            <ul className="list-disc ml-5">
              {matches.matches.map((m, i) => (
                <li key={i}>User: {m.userId} — Confidence: {(m.confidence * 100).toFixed(2)}%</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}