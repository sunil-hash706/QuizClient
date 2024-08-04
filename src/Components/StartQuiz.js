import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StartQuiz.css';

const StartQuiz = ({ navigate }) => {
  const [quizId, setQuizId] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timer, setTimer] = useState(6); // Timer starts at 3 seconds

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('https://quiz-n8v9.onrender.com/api/quizzes');
        setQuizzes(response.data);
      } catch (err) {
        console.error('Error fetching quizzes', err);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    let interval;
    if (showFeedback && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (showFeedback && timer === 0) {
      setShowFeedback(false);
      setTimer(6); // Reset timer for the next question
      setCurrentQuestionIndex(prevIndex => prevIndex + 1); // Move to next question
    }
    return () => clearInterval(interval);
  }, [showFeedback, timer]);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleOptionClick = (option) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const correctOption = currentQuestion.correctAnswer.trim();
    const newAnsweredQuestions = { ...answeredQuestions };

    const optionStatus = {};
    currentQuestion.options.forEach(opt => {
      if (opt === correctOption) {
        optionStatus[opt] = 'correct';
      } else if (opt === option) {
        optionStatus[opt] = 'incorrect';
      } else {
        optionStatus[opt] = 'default';
      }
    });

    newAnsweredQuestions[currentQuestionIndex] = optionStatus;
    setAnsweredQuestions(newAnsweredQuestions);
    setShowFeedback(true);

    if (option === correctOption) {
      setFeedbackMessage('Correct Answer');
      setCorrectCount(correctCount + 1);
    } else {
      setFeedbackMessage('Wrong Answer');
      setIncorrectCount(incorrectCount + 1);
    }
  };

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://quiz-n8v9.onrender.com/api/quizzes/${quizId}`);
      const shuffledQuestions = shuffleArray(response.data.questions).map(question => ({
        ...question,
        options: shuffleArray(question.options)
      }));
      setQuiz({ ...response.data, questions: shuffledQuestions });
    } catch (err) {
      setError('Quiz not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Start Quiz</h2>
      <div className="scoreboard">
        <p>Correct: {correctCount}</p>
        <p>Incorrect: {incorrectCount}</p>
      </div>
      {!quiz && (
        <>
          <select
            value={quizId}
            onChange={(e) => setQuizId(e.target.value)}
          >
            <option value="">Select Quiz</option>
            {quizzes.map((quiz) => (
              <option key={quiz._id} value={quiz._id}>
                {quiz.title}
              </option>
            ))}
          </select>
          <button onClick={fetchQuiz} disabled={!quizId}>Start Quiz</button>
        </>
      )}

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {quiz && quiz.questions.length > 0 && currentQuestionIndex < quiz.questions.length && (
        <div>
          <h3>{quiz.questions[currentQuestionIndex].questionText}</h3>
          <div>
            {quiz.questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`option-button ${answeredQuestions[currentQuestionIndex]?.[option] || (selectedOptions.includes(option) ? 'selected' : '')}`}
              >
                {option}
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className="feedback-container">
              <p className={feedbackMessage === 'Correct Answer' ? 'feedback-correct' : 'feedback-wrong'}>{feedbackMessage}</p>
              <p>Next question in {timer} seconds...</p>
            </div>
          )}
        </div>
      )}
      {quiz && currentQuestionIndex >= quiz.questions.length && (
        <div>
          <h3>Quiz Completed!</h3>
          <p>Your final score is:</p>
          <p>Correct: {correctCount}</p>
          <p>Incorrect: {incorrectCount}</p>
        </div>
      )}
      <button onClick={() => navigate('home')}>Home</button>
      {quiz && <button onClick={() => navigate('createQuiz')}>Create Quiz</button>}
    </div>
  );
};

export default StartQuiz;
