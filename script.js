document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    
    const questionCountSelect = document.getElementById('question-count');
    const startBtn = document.getElementById('start-btn');
    const submitBtn = document.getElementById('submit-btn');
    const retryBtn = document.getElementById('retry-btn');
    
    const currentQuestionEl = document.getElementById('current-question');
    const totalQuestionsEl = document.getElementById('total-questions');
    const timerEl = document.getElementById('timer');
    
    const num1El = document.getElementById('num1');
    const num2El = document.getElementById('num2');
    const answerInput = document.getElementById('answer-input');
    
    const feedbackEl = document.getElementById('feedback');
    const feedbackMessageEl = document.getElementById('feedback-message');
    const correctAnswerEl = document.getElementById('correct-answer');
    
    const resultTotalEl = document.getElementById('result-total');
    const resultCorrectEl = document.getElementById('result-correct');
    const resultIncorrectEl = document.getElementById('result-incorrect');
    const resultAccuracyEl = document.getElementById('result-accuracy');
    const resultTimeEl = document.getElementById('result-time');
    
    // Game state
    let gameState = {
        questionCount: 10,
        currentQuestion: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        startTime: null,
        endTime: null,
        timerInterval: null,
        currentNum1: null,
        currentNum2: null
    };
    
    // Utility functions
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function generateQuestion() {
        // Generate random numbers between 1 and 9 for 9x9 multiplication table
        gameState.currentNum1 = getRandomNumber(1, 9);
        gameState.currentNum2 = getRandomNumber(1, 9);
        
        num1El.textContent = gameState.currentNum1;
        num2El.textContent = gameState.currentNum2;
        
        answerInput.value = '';
        answerInput.focus();
        
        currentQuestionEl.textContent = gameState.currentQuestion + 1;
    }
    
    function updateTimer() {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - gameState.startTime) / 1000);
        timerEl.textContent = formatTime(elapsedSeconds);
    }
    
    function startTimer() {
        gameState.startTime = new Date();
        gameState.timerInterval = setInterval(updateTimer, 1000);
    }
    
    function stopTimer() {
        clearInterval(gameState.timerInterval);
        gameState.endTime = new Date();
        const totalSeconds = Math.floor((gameState.endTime - gameState.startTime) / 1000);
        return formatTime(totalSeconds);
    }
    
    function showFeedback(isCorrect, correctAnswer) {
        feedbackEl.classList.remove('correct', 'incorrect', 'show');
        feedbackEl.classList.add(isCorrect ? 'correct' : 'incorrect');
        feedbackEl.classList.remove('hidden');
        
        feedbackMessageEl.textContent = isCorrect 
            ? '答對了！👏' 
            : '答錯了 😢';
        
        correctAnswerEl.textContent = isCorrect 
            ? '' 
            : `正確答案是：${correctAnswer}`;
        
        // Show feedback with slight delay for the animation
        setTimeout(() => {
            feedbackEl.classList.add('show');
        }, 10);
        
        // Automatically hide feedback after a short delay
        setTimeout(() => {
            feedbackEl.classList.remove('show');
            // Add a transition end listener to add the hidden class after animation completes
            const transitionEnd = () => {
                feedbackEl.classList.add('hidden');
                feedbackEl.removeEventListener('transitionend', transitionEnd);
            };
            feedbackEl.addEventListener('transitionend', transitionEnd);
        }, isCorrect ? 1000 : 2000);
    }
    
    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value, 10);
        const correctAnswer = gameState.currentNum1 * gameState.currentNum2;
        
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
            gameState.correctAnswers++;
        } else {
            gameState.incorrectAnswers++;
        }
        
        showFeedback(isCorrect, correctAnswer);
        
        gameState.currentQuestion++;
        
        // Check if game is over
        if (gameState.currentQuestion >= gameState.questionCount) {
            setTimeout(showResults, isCorrect ? 1200 : 2200);
        } else {
            setTimeout(generateQuestion, isCorrect ? 1200 : 2200);
        }
    }
    
    function showResults() {
        const totalTime = stopTimer();
        const accuracy = Math.round((gameState.correctAnswers / gameState.questionCount) * 100);
        
        resultTotalEl.textContent = gameState.questionCount;
        resultCorrectEl.textContent = gameState.correctAnswers;
        resultIncorrectEl.textContent = gameState.incorrectAnswers;
        resultAccuracyEl.textContent = `${accuracy}%`;
        resultTimeEl.textContent = totalTime;
        
        gameScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
    }
    
    function startGame() {
        gameState.questionCount = parseInt(questionCountSelect.value, 10);
        gameState.currentQuestion = 0;
        gameState.correctAnswers = 0;
        gameState.incorrectAnswers = 0;
        
        totalQuestionsEl.textContent = gameState.questionCount;
        
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        resultScreen.classList.add('hidden');
        feedbackEl.classList.remove('show');
        feedbackEl.classList.add('hidden');
        
        startTimer();
        generateQuestion();
    }
    
    function resetGame() {
        resultScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    }
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    
    submitBtn.addEventListener('click', () => {
        if (answerInput.value.trim() !== '') {
            checkAnswer();
        } else {
            answerInput.focus();
        }
    });
    
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && answerInput.value.trim() !== '') {
            checkAnswer();
        }
    });
    
    retryBtn.addEventListener('click', resetGame);
    
    // Allow only numbers in input
    answerInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}); 