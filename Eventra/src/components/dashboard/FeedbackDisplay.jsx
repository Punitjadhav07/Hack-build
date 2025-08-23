function FeedbackDisplay({ feedback, isAdmin = false }) {
  if (!feedback || feedback.length === 0) {
    return (
      <div className="feedback-section">
        <h4 className="feedback-title">Feedback</h4>
        <p className="muted">No feedback yet</p>
      </div>
    )
  }

  const averageRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length

  return (
    <div className="feedback-section">
      <div className="feedback-header">
        <h4 className="feedback-title">Feedback ({feedback.length})</h4>
        <div className="average-rating">
          <span className="rating-stars">
            {'⭐'.repeat(Math.round(averageRating))}
          </span>
          <span className="rating-text">({averageRating.toFixed(1)}/5)</span>
        </div>
      </div>
      <div className="feedback-list">
        {feedback.map((f) => (
          <div key={f.id} className="feedback-item">
            <div className="feedback-meta">
              <div className="feedback-rating">
                <span className="rating-stars">{'⭐'.repeat(f.rating)}</span>
                <span className="rating-number">({f.rating}/5)</span>
              </div>
              <div className="feedback-user">
                {isAdmin ? (
                  <span className="user-name">{f.userName || 'Anonymous'}</span>
                ) : (
                  <span className="user-name">You</span>
                )}
                <span className="feedback-date">
                  {new Date(f.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="feedback-comment">{f.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeedbackDisplay



