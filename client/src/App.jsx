import { useState, useRef } from 'react';
import PromptInput from './components/PromptInput.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import ResultView from './components/ResultView.jsx';
import { generateStudySet } from './lib/api.js';
import { validateResult } from './lib/validateResult.js';

function App() {
  const [input, setInput] = useState('');
  const [cardCount, setCardCount] = useState(6);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'error' | 'success'
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Guards against a slow earlier request resolving after a faster later one
  // and silently overwriting the correct, newer result.
  const requestId = useRef(0);

  async function handleGenerate() {
    if (!input.trim()) return;

    const id = ++requestId.current;
    setStatus('loading');
    setErrorMessage('');

    try {
      const raw = await generateStudySet(input, cardCount);
      const parsed = validateResult(raw);

      if (id !== requestId.current) return; // a newer request has since started

      if (!parsed) {
        setStatus('error');
        setErrorMessage("The AI's response didn't match the expected format. Please try again.");
        return;
      }

      setResult(parsed);
      setStatus('success');
    } catch (err) {
      if (id !== requestId.current) return;
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong.');
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-line">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Flam / study lab</span>
        </div>
        <h1>Turn notes into momentum.</h1>
        <p>Paste a topic or your notes. Build a focused set of flashcards, then test what stuck.</p>
      </header>

      <PromptInput
        value={input}
        onChange={setInput}
        onSubmit={handleGenerate}
        cardCount={cardCount}
        onCardCountChange={setCardCount}
        disabled={status === 'loading'}
      />

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState message={errorMessage} onRetry={handleGenerate} />}
      {status === 'success' && result && <ResultView data={result} />}
      {status === 'idle' && !result && (
        <p className="empty-state">Enter a topic above and hit Generate to get started.</p>
      )}
    </div>
  );
}

export default App;
