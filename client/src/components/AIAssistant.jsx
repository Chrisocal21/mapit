import { useState } from 'react'
import { getAIOptimizationSuggestions } from '../utils/api'
import './AIAssistant.css'

function AIAssistant({ mapSettings }) {
  const [isOpen, setIsOpen] = useState(false)
  const [purpose, setPurpose] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState(null)

  async function handleGetSuggestions() {
    if (!purpose.trim()) {
      alert('Please enter a purpose for your map')
      return
    }

    setLoading(true)
    
    try {
      const response = await getAIOptimizationSuggestions(
        purpose,
        mapSettings?.style || 'streets-v12'
      )
      
      setSuggestions(response)
    } catch (error) {
      console.error('AI error:', error)
      alert('AI assistant is not available. Check your API key configuration.')
    } finally {
      setLoading(false)
    }
  }

  function applySuggestions() {
    if (suggestions) {
      // Notify parent component to apply suggestions
      alert(`AI suggests:\nStyle: ${suggestions.suggestedStyle}\nSize: ${suggestions.suggestedDimensions}\n\n${suggestions.reasoning}`)
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <button 
        className="ai-trigger-btn"
        onClick={() => setIsOpen(true)}
        title="Get AI suggestions"
      >
        AI Assistant
      </button>
    )
  }

  return (
    <div className="ai-assistant-panel">
      <div className="ai-header">
        <h3>AI Assistant</h3>
        <button 
          className="close-btn"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      </div>

      {!suggestions ? (
        <div className="ai-input-section">
          <label>
            <strong>What's the purpose of this map?</strong>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Laser engraving a city map for a gift, creating a wall art piece, marking hiking trails..."
              rows={4}
              disabled={loading}
            />
          </label>

          <button
            className="btn-primary"
            onClick={handleGetSuggestions}
            disabled={loading || !purpose.trim()}
          >
            {loading ? 'Analyzing...' : 'Get Suggestions'}
          </button>
        </div>
      ) : (
        <div className="ai-results">
          <div className="purpose-display">
            <span className="label">PURPOSE</span>
            <p>"{purpose}"</p>
          </div>

          <div className="suggestions-grid">
            <div className="suggestion-card">
              <span className="label">SUGGESTED STYLE</span>
              <strong>{suggestions.suggestedStyle}</strong>
            </div>

            <div className="suggestion-card">
              <span className="label">RECOMMENDED SIZE</span>
              <strong>{suggestions.suggestedDimensions}</strong>
            </div>
          </div>

          <div className="reasoning-card">
            <span className="label">REASONING</span>
            <p>{suggestions.reasoning}</p>
          </div>

          {suggestions.additionalTips && (
            <div className="tips-card">
              <span className="label">ADDITIONAL TIPS</span>
              <ul>
                {suggestions.additionalTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="ai-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                setSuggestions(null)
                setPurpose('')
              }}
            >
              Try Again
            </button>
            <button
              className="btn-primary"
              onClick={applySuggestions}
            >
              Apply Suggestions
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIAssistant
