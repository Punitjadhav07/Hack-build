import { useState, useEffect, useRef } from 'react'
import './notification-popup.css'

function NotificationPopup({ notifications = [], onClose, onMarkAsRead, onDeleteNotification }) {
  const [isVisible, setIsVisible] = useState(false)
  const popupRef = useRef(null)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 200) // Wait for animation to complete
  }

  const handleMarkAsRead = (notificationId) => {
    onMarkAsRead?.(notificationId)
  }

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (notification.unread) {
        onMarkAsRead?.(notification.id)
      }
    })
  }

  const handleDeleteNotification = (notificationId) => {
    onDeleteNotification?.(notificationId)
  }

  const handleDeleteAllNotifications = () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      notifications.forEach(notification => {
        onDeleteNotification?.(notification.id)
      })
    }
  }

  const unreadCount = notifications.filter(n => n.unread).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return '🎉'
      case 'reminder':
        return '⏰'
      case 'update':
        return '📢'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '📌'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event':
        return 'notification-event'
      case 'reminder':
        return 'notification-reminder'
      case 'update':
        return 'notification-update'
      case 'success':
        return 'notification-success'
      case 'warning':
        return 'notification-warning'
      case 'error':
        return 'notification-error'
      default:
        return 'notification-default'
    }
  }

  return (
    <div className={`notification-popup-overlay ${isVisible ? 'visible' : ''}`}>
      <div ref={popupRef} className={`notification-popup ${isVisible ? 'visible' : ''}`}>
        {/* Header */}
        <div className="notification-header">
          <div className="notification-title">
            <span className="notification-icon">🔔</span>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button 
                className="notification-action-btn"
                onClick={handleMarkAllAsRead}
                title="Mark all as read"
              >
                ✓
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                className="notification-action-btn notification-delete-all"
                onClick={handleDeleteAllNotifications}
                title="Delete all notifications"
              >
                🗑️
              </button>
            )}
            <button 
              className="notification-close-btn"
              onClick={handleClose}
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="notification-content">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="notification-empty-icon">🔕</div>
              <p>No notifications yet</p>
              <span>You're all caught up!</span>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification, index) => (
                <div 
                  key={notification.id || index}
                  className={`notification-item ${getNotificationColor(notification.type)} ${notification.unread ? 'unread' : ''}`}
                  onClick={() => notification.unread && handleMarkAsRead(notification.id)}
                >
                  <div className="notification-item-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-item-content">
                    <div className="notification-item-header">
                      <h4 className="notification-item-title">
                        {notification.title || notification.message || 'Notification'}
                      </h4>
                      {notification.unread && (
                        <span className="notification-unread-dot"></span>
                      )}
                    </div>
                    <p className="notification-item-message">
                      {notification.message || notification.msg || notification.description || 'No message content'}
                    </p>
                    <div className="notification-item-meta">
                      <span className="notification-time">
                        {notification.timestamp ? 
                          new Date(notification.timestamp).toLocaleDateString() : 
                          'Just now'
                        }
                      </span>
                      {notification.category && (
                        <span className="notification-category">{notification.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="notification-item-actions">
                    {notification.unread && (
                      <button 
                        className="notification-mark-read"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button 
                      className="notification-delete"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(notification.id)
                      }}
                      title="Delete notification"
                    >
                      ✂️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 3 && (
          <div className="notification-footer">
            <div className="notification-footer-text">
              Showing {Math.min(notifications.length, 5)} of {notifications.length} notifications
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationPopup
