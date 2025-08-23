import { useState } from 'react'

function FeedbackForm({ event, onSubmit, onCancel }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (comment.trim()) {
      onSubmit({ rating, comment: comment.trim() })
    }
  }

  return (
    <div className="feedback-form">
      <div className="panel-h">
        <h3 className="panel-t">Give Feedback</h3>
        <p className="panel-d">Share your experience for: {event.title}</p>
      </div>
      <form onSubmit={handleSubmit} className="list">
        <div>
          <p className="row-title">Rating</p>
          <select 
            className="input" 
            value={rating} 
            onChange={(e) => setRating(parseInt(e.target.value))}
          >
            <option value={5}>⭐⭐⭐⭐⭐ Excellent (5)</option>
            <option value={4}>⭐⭐⭐⭐ Very Good (4)</option>
            <option value={3}>⭐⭐⭐ Good (3)</option>
            <option value={2}>⭐⭐ Fair (2)</option>
            <option value={1}>⭐ Poor (1)</option>
          </select>
        </div>
        <div>
          <p className="row-title">Comments</p>
          <textarea 
            className="input" 
            rows="3" 
            placeholder="Share your thoughts about this event..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>
        <div className="btn-row" style={{justifyContent:'flex-end'}}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn">
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  )
}

export default FeedbackForm



