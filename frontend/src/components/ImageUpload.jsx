import { useState } from 'react'
import { uploadImage, recognizeFace } from '../api/backend'

export default function ImageUpload({ onUploaded, onRecognized }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')

  const getCurrentPosition = () => new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Geolocation not supported'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setNote('')
    try {
      let coords = { lat: null, lng: null }
      try {
        coords = await getCurrentPosition()
      } catch (geoErr) {
        setNote('⚠️ Location unavailable, uploading without coordinates.')
        console.log(geoErr);
      }

      const formData = new FormData()
      formData.append('image', file)
      if (coords.lat && coords.lng) {
        formData.append('lat', coords.lat)
        formData.append('lng', coords.lng)
      }

      const { data } = await uploadImage(formData)
      onUploaded?.(data) // expected to include fileId, saved image meta

      // Optional recognition — app must keep working if service is down
      if (data?.fileId) {
        try {
          const res = await recognizeFace(data.fileId)
          onRecognized?.(res.data)
        } catch (recErr) {
          setNote('ℹ️ Face service not available yet. Image saved and location recorded.')
          console.log(recErr);
        }
      }
    } catch (err) {
      console.error(err)
      setNote('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow bg-white flex flex-col gap-3">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="border p-2 rounded" />
      <button type="submit" disabled={!file || loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Uploading…' : 'Upload'}
      </button>
      {note && <p className="text-sm text-gray-600">{note}</p>}
    </form>
  )
}