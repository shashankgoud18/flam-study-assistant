import { useEffect, useState } from 'react';

function Quiz({ questions }) {
  const [activeQuestions, setActiveQuestions] = useState(questions);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedOptionIndex }
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setActiveQuestions(questions);
    setAnswers({});
    setSubmitted(false);
  }, [questions]);

  function selectAnswer(id, optionIndex) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [id]: optionIndex }));
  }

  const wrongQuestions = activeQuestions.filter((q) => answers[q.id] !== q.correctIndex);
  const score = activeQuestions.length - wrongQuestions.length;
  const allAnswered = activeQuestions.every((q) => answers[q.id] !== undefined);

  function retryWrong() {
    setActiveQuestions(wrongQuestions);
    setAnswers({});
    setSubmitted(false);
  }

  function restartAll() {
    setActiveQuestions(questions);
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="quiz">
      <div className="quiz-header">
        <div>
          <span className="section-label">02 / Check your recall</span>
          <p className="quiz-title">Make it stick.</p>
        </div>
        <span className="quiz-progress">{Object.keys(answers).length} / {activeQuestions.length} answered</span>
      </div>
      {activeQuestions.map((q, questionIndex) => (
        <div key={q.id} className="quiz-question" style={{ '--question-order': questionIndex }}>
          <span className="question-index">0{questionIndex + 1}</span>
          <p className="question-text">{q.question}</p>
          <div className="options">
            {q.options.map((option, i) => {
              const isSelected = answers[q.id] === i;
              const isCorrectOption = i === q.correctIndex;

              let className = 'option';
              if (isSelected) className += ' selected';
              if (submitted && isCorrectOption) className += ' correct';
              if (submitted && isSelected && !isCorrectOption) className += ' incorrect';

              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => selectAnswer(q.id, i)}
                  disabled={submitted}
                >
                  <span className="option-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          className="submit-btn"
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
        >
          Submit answers
        </button>
      ) : (
        <div className="quiz-results">
          <p>
            Score: {score} / {activeQuestions.length}
          </p>
          {wrongQuestions.length > 0 && (
            <button onClick={retryWrong}>Retest {wrongQuestions.length} wrong answer(s)</button>
          )}
          <button onClick={restartAll}>Restart full quiz</button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
