import { useAuth } from '../../context/AuthContext'

export default function AdminSettings() {
  const { user } = useAuth()

  return (
    <div>
      <h2 className="card-title mb-3">Settings</h2>
      <div className="card mb-3">
        <h3 className="font-semibold">Signed in admin</h3>
        <p className="text-sm mt-1">{user?.name}</p>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-2">Production security model</h3>
        <ul className="text-sm" style={{ paddingLeft: 18 }}>
          <li>Passwords hashed with bcrypt on the API server</li>
          <li>JWT sessions (Bearer token in sessionStorage)</li>
          <li>Membership, orders, and certificates only change via server routes</li>
          <li>Admin routes require role=admin in the database</li>
          <li>Payment success must be confirmed by the server (mock adapter until Stripe/Razorpay webhooks)</li>
          <li>Progress syncs to the database; XP jumps are soft-capped server-side</li>
          <li>Public certificate verification reads the database only</li>
        </ul>
        <p className="text-sm text-muted mt-3">
          Set <code>CQ_JWT_SECRET</code>, <code>CQ_ADMIN_EMAIL</code>, and <code>CQ_ADMIN_PASSWORD</code> in
          the server environment before public deployment. Never commit real secrets.
        </p>
      </div>
    </div>
  )
}
