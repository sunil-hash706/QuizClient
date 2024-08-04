import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure to install axios
import './StartQuiz.css'; // Import the CSS file

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

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quizzes');
        setQuizzes(response.data);
      } catch (err) {
        console.error('Error fetching quizzes', err);
      }
    };
    fetchQuizzes();
  }, []);

  const handleOptionClick = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((opt) => opt !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const handleNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedOptions([]);
    setShowFeedback(false);
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
    setSelectedOptions([]);
    setShowFeedback(false);
  };

  const handleCheckAnswer = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const correctOptions = currentQuestion.correctAnswer.split(', ').map(opt => opt.trim());
    const newAnsweredQuestions = { ...answeredQuestions };

    const optionStatus = {};
    currentQuestion.options.forEach(option => {
      if (correctOptions.includes(option)) {
        optionStatus[option] = 'correct';
      } else if (selectedOptions.includes(option)) {
        optionStatus[option] = 'incorrect';
      } else {
        optionStatus[option] = 'default';
      }
    });

    newAnsweredQuestions[currentQuestionIndex] = optionStatus;
    setAnsweredQuestions(newAnsweredQuestions);
    setShowFeedback(true);

    if (correctOptions.every(opt => selectedOptions.includes(opt)) && selectedOptions.length === correctOptions.length) {
      setFeedbackMessage('Correct Answer');
    } else {
      setFeedbackMessage('Wrong Answer');
    }
  };

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`);
      setQuiz(response.data);
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

      {quiz && quiz.questions.length > 0 && (
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
          <div>
            <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous Question</button>
            <button onClick={handleNext} disabled={currentQuestionIndex === quiz.questions.length - 1}>Next Question</button>
            <button onClick={handleCheckAnswer}>Check Answer</button>
          </div>
          {showFeedback && <p className={feedbackMessage === 'Correct Answer' ? 'feedback-correct' : 'feedback-wrong'}>{feedbackMessage}</p>}
        </div>
      )}
      <button onClick={() => navigate('home')}>Home</button>
      {quiz && <button onClick={() => navigate('createQuiz')}>Create Quiz</button>}
    </div>
  );
};

export default StartQuiz;
