export default function MicButton({ isRecording, isSpeaking, status, onStart, onStop }) {
  const disabled = isSpeaking || status === 'connecting' || status === 'thinking'
  return (
    <button
      className={`mic-btn ${isRecording ? 'recording' : ''} ${isSpeaking ? 'speaking' : ''} ${disabled && !isRecording ? 'disabled' : ''}`}
      onMouseDown={!disabled ? onStart : undefined}
      onMouseUp={isRecording ? onStop : undefined}
      onTouchStart={e => { e.preventDefault(); if (!disabled) onStart() }}
      onTouchEnd={e => { e.preventDefault(); if (isRecording) onStop() }}
    >
      {isRecording && <><span className="mic-ring ring-1"/><span className="mic-ring ring-2"/><span className="mic-ring ring-3"/></>}
      {isSpeaking && <span className="mic-ring speaking-ring"/>}
      <span className="mic-icon">{isRecording ? '⏹' : isSpeaking ? '🔊' : '🎤'}</span>
    </button>
  )
}