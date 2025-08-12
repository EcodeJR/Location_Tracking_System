export default function MatchesList({ matches }) {
    if (!matches?.matches?.length) return null
    return (
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Matches</h3>
        <ul className="space-y-2">
          {matches.matches.map((m, idx) => (
            <li key={idx} className="border p-2 rounded shadow-sm">
              <span className="font-medium">User ID:</span> {m.userId} <br />
              <span className="font-medium">Confidence:</span> {(m.confidence * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    )
  }