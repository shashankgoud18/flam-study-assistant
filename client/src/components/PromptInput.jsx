function PromptInput({ value, onChange, onSubmit, disabled }) {
  function handleKeyDown(e) {
    // Cmd/Ctrl+Enter submits; plain Enter still inserts a newline in the textarea.
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onSubmit();
    }
  }

  return (
    <div className="prompt-input">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste your notes, or just type a topic (e.g. 'Photosynthesis')…"
        rows={6}
        disabled={disabled}
      />
      <button onClick={onSubmit} disabled={disabled || !value.trim()}>
        {disabled ? 'Generating…' : 'Generate'}
      </button>
    </div>
  );
}

export default PromptInput;
