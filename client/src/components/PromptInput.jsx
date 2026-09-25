function PromptInput({ value, onChange, onSubmit, disabled }) {
  function handleKeyDown(e) {
    // Cmd/Ctrl+Enter submits; plain Enter still inserts a newline in the textarea.
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmit();
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
