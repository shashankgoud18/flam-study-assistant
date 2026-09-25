import { useEffect, useState, useRef } from 'react';
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
  const resultRef = useRef(null);

  // Guards against a slow earlier request resolving after a faster later one
  // and silently overwriting the correct, newer result.
  const requestId = useRef(0);

  useEffect(() => {
    if (status !== 'success') return;
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resultRef.current?.focus({ preventScroll: true });
  }, [status]);

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
          <span>Flam Study Lab</span>
        </div>
        <div className="header-layout">
          <div>
            <h1 className="masked-heading" aria-label="Learn it. Lock it in.">
              <span className="masked-line"><span>Learn it.</span></span>
              <span className="masked-line"><span>Lock it in.</span></span>
            </h1>
            <p className="fuzzy-copy">Turn notes into flashcards, then test what actually stuck.</p>
          </div>
          <div className="study-signal" aria-hidden="true">
            <div className="signal-grid" />
            <div className="signal-ring signal-ring--outer" />
            <div className="signal-ring signal-ring--inner" />
            <div className="signal-card signal-card--back" />
            <div className="signal-card signal-card--front">
              <span>01</span>
              <i />
              <i />
              <i />
            </div>
            <span className="signal-dot" />
            <span className="signal-caption">FOCUS / 01</span>
          </div>
        </div>
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
      {status === 'success' && result && (
        <div ref={resultRef} className="result-anchor" tabIndex="-1">
          <ResultView data={result} />
        </div>
      )}
      {status === 'idle' && !result && (
        <p className="empty-state">Enter a topic above and hit Generate to get started.</p>
      )}
    </div>
  );
}

export default App;
