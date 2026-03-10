export default function ChatMessage({ role, text }) {
  const isAI = role === 'ai', isSystem = role === 'system'
  return (
    <div className={`message-row ${isAI ? 'ai' : isSystem ? 'system' : 'user'}`}>
      {isAI && <div className="avatar ai-avatar">✚</div>}
      <div className={`bubble ${isAI ? 'ai-bubble' : isSystem ? 'system-bubble' : 'user-bubble'}`}>{text}</div>
      {!isAI && !isSystem && <div className="avatar user-avatar">👤</div>}
    </div>
  )
}