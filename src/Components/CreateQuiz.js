import React, { useState } from 'react';
import axios from 'axios';
import './CreateQuiz.css';

const CreateQuiz = ({ navigate }) => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']); // Initialize with 4 empty options
  const [correctOption, setCorrectOption] = useState(''); // Single correct option
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    const correctOptionValue = options[correctOption - 1];
    const newQuestion = {
      questionText: currentQuestion,
      options: options,
      correctAnswer: correctOptionValue,
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion('');
    setOptions(['', '', '', '']); // Reset to 4 empty options
    setCorrectOption(''); // Reset correct option
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const formattedTitle = title.toUpperCase(); // Convert title to uppercase
      await axios.post('https://quiz-n8v9.onrender.com/api/quizzes', {
        title: formattedTitle,
        questions,
      });
      navigate('startQuiz');
    } catch (err) {
      setError('Failed to submit quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-quiz-container">
      <h2>Create a New Quiz</h2>
      <input
        type="text"
        placeholder="Enter Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value.toUpperCase())} // Ensure title is uppercase
      />
      <input
        type="text"
        placeholder="Enter Question"
        value={currentQuestion}
        onChange={(e) => setCurrentQuestion(e.target.value)}
      />
      <div>
        {options.map((option, index) => (
          <div key={index} className="option-container">
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div>
        <input
          type="number"
          placeholder="Correct Option (1-4)"
          value={correctOption}
          onChange={(e) => setCorrectOption(e.target.value)}
        />
      </div>
      <button onClick={addQuestion}>Add Question</button>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Quiz'}
      </button>
      {error && <p className="error-message">{error}</p>}
      <button onClick={() => navigate('home')}>Home</button>
      <button onClick={() => navigate('startQuiz')}>Start Quiz</button>
    </div>
  );
};

export default CreateQuiz;
