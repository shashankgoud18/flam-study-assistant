import { useState } from 'react';
import FlashcardDeck from './FlashcardDeck.jsx';
import Quiz from './Quiz.jsx';

function ResultView({ data }) {
  const [mode, setMode] = useState('cards'); // 'cards' | 'quiz'

  return (
    <div className="result-view">
      <h2 className="result-topic">{data.topic}</h2>

      <div className="mode-toggle">
        <button className={mode === 'cards' ? 'active' : ''} onClick={() => setMode('cards')}>
          Flashcards
        </button>
        <button className={mode === 'quiz' ? 'active' : ''} onClick={() => setMode('quiz')}>
          Quiz
        </button>
      </div>

      {mode === 'cards' ? <FlashcardDeck cards={data.cards} /> : <Quiz questions={data.quiz} />}
    </div>
  );
}

export default ResultView;
