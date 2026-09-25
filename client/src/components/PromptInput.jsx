import { useState } from 'react';
import { extractTextFromFile } from '../lib/extractText.js';

function PromptInput({ value, onChange, onSubmit, cardCount, onCardCountChange, disabled }) {
  const [fileStatus, setFileStatus] = useState('');

  function handleKeyDown(e) {
    // Cmd/Ctrl+Enter submits; plain Enter still inserts a newline in the textarea.
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmit();
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setFileStatus(`Reading ${file.name}...`);
    try {
      const text = (await extractTextFromFile(file)).trim();
      if (!text) throw new Error('No readable text was found in that file.');
      onChange(text);
      setFileStatus(`${file.name} imported`);
    } catch (error) {
      setFileStatus(error.message || 'Could not read that file.');
    }
  }

  return (
    <div className="prompt-input">
      <div className="prompt-heading">
        <div>
          <span className="section-label">01 / Start with anything</span>
          <label htmlFor="study-input">What are you learning?</label>
        </div>
        <span className="input-hint">Ctrl + Enter</span>
      </div>
      <textarea
        id="study-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste notes, a lecture summary, or a topic like Photosynthesis..."
        rows={6}
        disabled={disabled}
      />
      <div className="upload-row">
        <label className="upload-button" htmlFor="study-file">
          <span aria-hidden="true">+</span> Upload notes
        </label>
        <input
          id="study-file"
          className="file-input"
          type="file"
          accept=".pdf,.docx,.pptx,.txt"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <span className="file-status" role="status">{fileStatus || 'PDF, Word, PowerPoint, or TXT'}</span>
      </div>
      <div className="card-count-row">
        <label htmlFor="card-count">Flashcards</label>
        <input
          id="card-count"
          type="range"
          min="3"
          max="12"
          value={cardCount}
          onChange={(e) => onCardCountChange(Number(e.target.value))}
          disabled={disabled}
        />
        <output htmlFor="card-count">{cardCount}</output>
      </div>
      <div className="prompt-footer">
        <span>{value.length > 0 ? `${value.length} characters ready` : 'The more context you add, the sharper the set.'}</span>
        <button onClick={onSubmit} disabled={disabled || !value.trim()}>
          {disabled ? 'Building set...' : 'Build study set'}
          <span aria-hidden="true">-&gt;</span>
        </button>
      </div>
    </div>
  );
}

export default PromptInput;
