import React, { useState } from 'react';
import CreateQuiz from './Components/CreateQuiz';
import StartQuiz from './Components/StartQuiz';
import './App.css'; // Import the CSS file

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <>
          <h1>Quiz App</h1>
          <button onClick={() => navigate('startQuiz')}>Start Quiz</button>
          <button onClick={() => navigate('createQuiz')}>Create Quiz</button>
        </>
      )}
      {currentPage === 'startQuiz' && <StartQuiz navigate={navigate} />}
      {currentPage === 'createQuiz' && <CreateQuiz navigate={navigate} />}
    </div>
  );
};

export default App;
