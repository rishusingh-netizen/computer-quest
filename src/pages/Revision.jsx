import { useParams, Link } from 'react-router-dom'
import { RefreshCw } from '../components/ui/Icons'
import { REVISION_TOPICS, getRevisionTopic } from '../data/revision'
import { useProgress } from '../context/ProgressContext'
import RevisionTopic from '../components/revision/RevisionTopic'

export default function Revision() {
  const { topicId } = useParams()
  const { revisionCompleted, revisionScores, weakTopics, completeRevision } = useProgress()

  if (topicId) {
    const topic = getRevisionTopic(topicId)
    if (!topic) {
      return (
        <div className="card">
          <p>Topic not found.</p>
          <Link to="/revision" className="btn btn-secondary mt-3">All topics</Link>
        </div>
      )
    }
    return (
      <RevisionTopic
        topic={topic}
        onComplete={(score, total, xp) => completeRevision(topicId, score, total, xp, topic.relatedWeak || [])}
      />
    )
  }

  const topics = REVISION_TOPICS || []

  return (
    <div>
      <p className="text-muted mb-4 text-sm">
        Review weak areas and reinforce concepts. Completing revision can clear weak-topic flags when you score well.
      </p>
      {weakTopics?.length > 0 && (
        <div className="card mb-4">
          <h3 className="card-title mb-2">Your weak topics</h3>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {weakTopics.map((t) => (
              <span key={t} className="badge badge-warning">{t}</span>
            ))}
          </div>
        </div>
      )}
      <div className="grid-2">
        {topics.map((t) => {
          const done = revisionCompleted?.includes(t.id)
          const stats = revisionScores?.[t.id]
          return (
            <Link key={t.id} to={`/revision/${t.id}`} className="card practice-card">
              <div className="flex items-center gap-3 mb-2">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--cq-primary-light)',
                    color: 'var(--cq-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">{t.title}</h3>
                  {done && <span className="badge badge-success">Done</span>}
                </div>
              </div>
              <p className="text-sm text-muted">{t.description}</p>
              {stats && (
                <p className="text-sm mt-2">Best: {stats.bestScore} · Attempts: {stats.attempts}</p>
              )}
            </Link>
          )
        })}
      </div>
      {topics.length === 0 && (
        <div className="card page-placeholder">
          <p className="text-muted">Revision topics coming soon.</p>
        </div>
      )}
    </div>
  )
}
