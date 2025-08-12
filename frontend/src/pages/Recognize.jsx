import { useState } from 'react'
import ImageUpload from '../components/ImageUpload'
import MatchesList from '../components/MatchesList'

export default function Recognize() {
  const [matches, setMatches] = useState({})
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Face Recognition</h1>
      <ImageUpload onRecognized={setMatches} />
      <MatchesList matches={matches} />
    </div>
  )
}