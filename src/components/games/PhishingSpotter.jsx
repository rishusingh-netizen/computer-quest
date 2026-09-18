export default function PhishingSpotter({ game }) {
  return (
    <div>
      <p className="text-sm text-muted mb-3">{game?.instructions || 'Spot phishing messages.'}</p>
      <p className="text-sm">Phishing spotter simulation.</p>
    </div>
  )
}
