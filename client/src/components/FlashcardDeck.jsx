import { useEffect, useState } from 'react';

function FlashcardDeck({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [cards]);

  const card = cards[index];

  function next() {
    setFlipped(false);
    setIndex((i) => (i + 1) % cards.length);
  }

  function prev() {
    setFlipped(false);
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  }

  return (
    <div className="flashcard-deck">
      <p className="card-counter">
        {index + 1} / {cards.length}
      </p>

      <div className="flashcard" onClick={() => setFlipped((f) => !f)}>
        <p>{flipped ? card.answer : card.question}</p>
        <span className="flip-hint">
          {flipped ? 'Click to see question' : 'Click to reveal answer'}
        </span>
      </div>

      <div className="deck-nav">
        <button onClick={prev}>Previous</button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}

export default FlashcardDeck;
