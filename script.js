document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    const historyScreen = document.getElementById('history-screen');
    
    const questionCountSelect = document.getElementById('question-count');
    const historyLimitSelect = document.getElementById('history-limit');
    const startBtn = document.getElementById('start-btn');
    const submitBtn = document.getElementById('submit-btn');
    const retryBtn = document.getElementById('retry-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    const viewHistoryBtnResult = document.getElementById('view-history-btn-result');
    const backToHomeBtn = document.getElementById('back-to-home-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    
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
    const historyContainerEl = document.getElementById('history-container');
    
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
        currentNum2: null,
        historyLimit: 30
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
        }, isCorrect ? 600 : 800);
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
            setTimeout(showResults, isCorrect ? 1200 : 1200);
        } else {
            setTimeout(generateQuestion, isCorrect ? 1200 : 1200);
        }
    }
    
    // History functions
    function loadHistoryFromStorage() {
        const storedHistory = localStorage.getItem('practiceHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }
    
    function saveHistoryToStorage(history) {
        localStorage.setItem('practiceHistory', JSON.stringify(history));
    }
    
    function addResultToHistory(result) {
        const history = loadHistoryFromStorage();
        history.unshift(result); // Add to the beginning of the array
        
        // Limit history to the configured number of entries
        const historyLimit = parseInt(gameState.historyLimit, 10);
        if (history.length > historyLimit) {
            history.length = historyLimit;
        }
        
        saveHistoryToStorage(history);
    }
    
    function clearHistory() {
        localStorage.removeItem('practiceHistory');
        displayHistory(); // Refresh the empty history display
    }
    
    function displayHistory() {
        const history = loadHistoryFromStorage();
        historyContainerEl.innerHTML = '';
        
        if (history.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-history';
            emptyMessage.textContent = '尚無練習記錄';
            historyContainerEl.appendChild(emptyMessage);
            return;
        }

        // Add trend summary if we have more than one record
        if (history.length > 1) {
            const trendSummary = document.createElement('div');
            trendSummary.className = 'trend-summary';
            
            // Compare first (most recent) and last entry for overall trend
            const mostRecent = history[0];
            const oldest = history[history.length - 1];
            
            const accuracyDiff = mostRecent.accuracy - oldest.accuracy;
            const recentTimeSecs = parseTimeToSeconds(mostRecent.time);
            const oldestTimeSecs = parseTimeToSeconds(oldest.time);
            const timeDiff = oldestTimeSecs - recentTimeSecs;
            
            let accuracyTrend = '';
            if (accuracyDiff > 0) {
                accuracyTrend = `<span class="trend improved">正確率整體提升了 ${accuracyDiff}%</span>`;
            } else if (accuracyDiff < 0) {
                accuracyTrend = `<span class="trend declined">正確率整體下降了 ${Math.abs(accuracyDiff)}%</span>`;
            } else {
                accuracyTrend = `<span class="trend same">正確率維持不變</span>`;
            }
            
            let timeTrend = '';
            if (timeDiff > 0) {
                timeTrend = `<span class="trend improved">完成時間整體加快了 ${formatTimeChange(Math.abs(timeDiff))}</span>`;
            } else if (timeDiff < 0) {
                timeTrend = `<span class="trend declined">完成時間整體變慢了 ${formatTimeChange(Math.abs(timeDiff))}</span>`;
            } else {
                timeTrend = `<span class="trend same">完成時間維持不變</span>`;
            }
            
            trendSummary.innerHTML = `
                <h3>趨勢摘要</h3>
                <div class="trend-details">
                    ${accuracyTrend}
                    ${timeTrend}
                </div>
            `;
            
            historyContainerEl.appendChild(trendSummary);
        }
        
        history.forEach((entry, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Compare with previous entry for progress indicators
            let accuracyProgress = '';
            let timeProgress = '';
            
            if (index < history.length - 1) {
                // Compare accuracy
                const prevAccuracy = history[index + 1].accuracy;
                const currentAccuracy = entry.accuracy;
                const accuracyDiff = currentAccuracy - prevAccuracy;
                
                if (currentAccuracy > prevAccuracy) {
                    accuracyProgress = `<span class="progress-indicator improved" title="正確率提升了 ${accuracyDiff}%">↑</span>`;
                } else if (currentAccuracy < prevAccuracy) {
                    accuracyProgress = `<span class="progress-indicator declined" title="正確率下降了 ${Math.abs(accuracyDiff)}%">↓</span>`;
                } else {
                    accuracyProgress = '<span class="progress-indicator same" title="正確率維持不變">→</span>';
                }
                
                // Compare time
                // Parse time strings into seconds for comparison
                const prevTimeStr = history[index + 1].time;
                const currentTimeStr = entry.time;
                
                const prevTimeSecs = parseTimeToSeconds(prevTimeStr);
                const currentTimeSecs = parseTimeToSeconds(currentTimeStr);
                const timeDiffSecs = prevTimeSecs - currentTimeSecs;
                
                const timeDiffDisplay = formatTimeChange(Math.abs(timeDiffSecs));
                
                // For time, lower is better
                if (currentTimeSecs < prevTimeSecs) {
                    timeProgress = `<span class="progress-indicator improved" title="速度提升了 ${timeDiffDisplay}">↑</span>`;
                } else if (currentTimeSecs > prevTimeSecs) {
                    timeProgress = `<span class="progress-indicator declined" title="速度減慢了 ${timeDiffDisplay}">↓</span>`;
                } else {
                    timeProgress = '<span class="progress-indicator same" title="完成時間相同">→</span>';
                }
            }
            
            const historyDate = new Date(entry.date);
            const formattedDate = `${historyDate.getFullYear()}/${(historyDate.getMonth() + 1).toString().padStart(2, '0')}/${historyDate.getDate().toString().padStart(2, '0')} ${historyDate.getHours().toString().padStart(2, '0')}:${historyDate.getMinutes().toString().padStart(2, '0')}`;
            
            historyItem.innerHTML = `
                <div class="history-number">#${index + 1}</div>
                <div class="history-content">
                    <div class="history-date">${formattedDate}</div>
                    <div class="history-details">
                        <span>題數: ${entry.questionCount}</span>
                        <span>正確: ${entry.correctAnswers}</span>
                        <span>錯誤: ${entry.incorrectAnswers}</span>
                        <span class="history-accuracy">正確率: ${entry.accuracy}% ${accuracyProgress}</span>
                        <span class="history-time">花費時間: ${entry.time} ${timeProgress}</span>
                    </div>
                </div>
            `;
            
            historyContainerEl.appendChild(historyItem);
        });
    }
    
    // Format time change for display in tooltip
    function formatTimeChange(seconds) {
        if (seconds < 60) {
            return `${seconds} 秒`;
        } else {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            if (secs === 0) {
                return `${mins} 分鐘`;
            }
            return `${mins} 分 ${secs} 秒`;
        }
    }
    
    // Helper function to parse time string (MM:SS) to seconds
    function parseTimeToSeconds(timeStr) {
        const [minutes, seconds] = timeStr.split(':').map(part => parseInt(part, 10));
        return minutes * 60 + seconds;
    }
    
    function showHistory() {
        setupScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        historyScreen.classList.remove('hidden');
        
        displayHistory();
    }
    
    function showResults() {
        const totalTime = stopTimer();
        const accuracy = Math.round((gameState.correctAnswers / gameState.questionCount) * 100);
        
        resultTotalEl.textContent = gameState.questionCount;
        resultCorrectEl.textContent = gameState.correctAnswers;
        resultIncorrectEl.textContent = gameState.incorrectAnswers;
        
        // Save result to history
        const result = {
            date: gameState.startTime.toISOString(),
            questionCount: gameState.questionCount,
            correctAnswers: gameState.correctAnswers,
            incorrectAnswers: gameState.incorrectAnswers,
            accuracy: accuracy,
            time: totalTime
        };
        
        // Get previous result for comparison if available
        const history = loadHistoryFromStorage();
        let accuracyProgress = '';
        let timeProgress = '';
        const resultTrendSummaryEl = document.getElementById('result-trend-summary');
        resultTrendSummaryEl.innerHTML = '';
        
        if (history.length > 0) {
            // Compare with the most recent previous entry
            const prevResult = history[0];
            
            // Only compare if questions count is the same
            if (prevResult.questionCount === gameState.questionCount) {
                // Compare accuracy
                const prevAccuracy = prevResult.accuracy;
                const accuracyDiff = accuracy - prevAccuracy;
                
                if (accuracy > prevAccuracy) {
                    accuracyProgress = `<span class="progress-indicator improved" title="正確率提升了 ${accuracyDiff}%">↑</span>`;
                } else if (accuracy < prevAccuracy) {
                    accuracyProgress = `<span class="progress-indicator declined" title="正確率下降了 ${Math.abs(accuracyDiff)}%">↓</span>`;
                } else {
                    accuracyProgress = '<span class="progress-indicator same" title="正確率維持不變">→</span>';
                }
                
                // Compare time
                const prevTimeStr = prevResult.time;
                const prevTimeSecs = parseTimeToSeconds(prevTimeStr);
                const currentTimeSecs = parseTimeToSeconds(totalTime);
                const timeDiffSecs = prevTimeSecs - currentTimeSecs;
                
                const timeDiffDisplay = formatTimeChange(Math.abs(timeDiffSecs));
                
                // For time, lower is better
                if (currentTimeSecs < prevTimeSecs) {
                    timeProgress = `<span class="progress-indicator improved" title="速度提升了 ${timeDiffDisplay}">↑</span>`;
                } else if (currentTimeSecs > prevTimeSecs) {
                    timeProgress = `<span class="progress-indicator declined" title="速度減慢了 ${timeDiffDisplay}">↓</span>`;
                } else {
                    timeProgress = '<span class="progress-indicator same" title="完成時間相同">→</span>';
                }
                
                // Add trend summary
                let accuracyTrend = '';
                if (accuracyDiff > 0) {
                    accuracyTrend = `<span class="trend improved">正確率提升了 ${accuracyDiff}%</span>`;
                } else if (accuracyDiff < 0) {
                    accuracyTrend = `<span class="trend declined">正確率下降了 ${Math.abs(accuracyDiff)}%</span>`;
                } else {
                    accuracyTrend = `<span class="trend same">正確率維持不變</span>`;
                }
                
                let timeTrend = '';
                if (timeDiffSecs > 0) {
                    timeTrend = `<span class="trend improved">完成時間加快了 ${timeDiffDisplay}</span>`;
                } else if (timeDiffSecs < 0) {
                    timeTrend = `<span class="trend declined">完成時間變慢了 ${formatTimeChange(Math.abs(timeDiffSecs))}</span>`;
                } else {
                    timeTrend = `<span class="trend same">完成時間維持不變</span>`;
                }
                
                resultTrendSummaryEl.innerHTML = `
                    <h3>與上次練習比較</h3>
                    <div class="trend-details">
                        ${accuracyTrend}
                        ${timeTrend}
                    </div>
                `;
                resultTrendSummaryEl.style.display = 'block';
            } else {
                // Hide the trend summary if question counts don't match
                resultTrendSummaryEl.style.display = 'none';
            }
        } else {
            // Hide the trend summary if there's no previous history
            resultTrendSummaryEl.style.display = 'none';
        }
        
        resultAccuracyEl.innerHTML = `${accuracy}% ${accuracyProgress}`;
        resultTimeEl.innerHTML = `${totalTime} ${timeProgress}`;
        
        // Now add the new result to history
        addResultToHistory(result);
        
        gameScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
    }
    
    function startGame() {
        gameState.questionCount = parseInt(questionCountSelect.value, 10);
        gameState.historyLimit = parseInt(historyLimitSelect.value, 10);
        gameState.currentQuestion = 0;
        gameState.correctAnswers = 0;
        gameState.incorrectAnswers = 0;
        
        totalQuestionsEl.textContent = gameState.questionCount;
        
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        resultScreen.classList.add('hidden');
        historyScreen.classList.add('hidden');
        feedbackEl.classList.remove('show');
        feedbackEl.classList.add('hidden');
        
        startTimer();
        generateQuestion();
    }
    
    function resetGame() {
        resultScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    }
    
    function backToHome() {
        historyScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    }
    
    // Load history limit from localStorage if available
    function loadSettings() {
        const savedHistoryLimit = localStorage.getItem('historyLimit');
        if (savedHistoryLimit) {
            gameState.historyLimit = parseInt(savedHistoryLimit, 10);
            historyLimitSelect.value = savedHistoryLimit;
        }
    }
    
    // Save history limit to localStorage
    function saveSettings() {
        localStorage.setItem('historyLimit', historyLimitSelect.value);
    }
    
    // Event listeners
    startBtn.addEventListener('click', () => {
        saveSettings();
        startGame();
    });
    
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
    viewHistoryBtn.addEventListener('click', showHistory);
    viewHistoryBtnResult.addEventListener('click', showHistory);
    backToHomeBtn.addEventListener('click', backToHome);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Allow only numbers in input
    answerInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Initialize
    loadSettings();
}); 