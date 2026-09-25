import { useEffect, useState } from 'react';
import FlipCard from './FlipCard.jsx';

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

      <FlipCard
        flipped={flipped}
        onFlipChange={setFlipped}
        ariaLabel={`Flashcard ${index + 1}: ${card.question}`}
        front={
          <>
            <div>{card.question}</div>
            <span className="flip-card__hint">Click or drag to reveal answer</span>
          </>
        }
        back={
          <>
            <div>{card.answer}</div>
            <span className="flip-card__hint">Click or drag to see question</span>
          </>
        }
      />

      <div className="deck-nav">
        <button onClick={prev}>Previous</button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}

export default FlashcardDeck;
