document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    const historyScreen = document.getElementById('history-screen');
    
    const gameModeSelect = document.getElementById('game-mode');
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
    const resultEl = document.getElementById('result');
    const answerInput = document.getElementById('answer-input');
    
    const resultModeEl = document.getElementById('result-mode');
    const resultTotalEl = document.getElementById('result-total');
    const resultCorrectEl = document.getElementById('result-correct');
    const resultIncorrectEl = document.getElementById('result-incorrect');
    const resultAccuracyEl = document.getElementById('result-accuracy');
    const resultTimeEl = document.getElementById('result-time');
    const historyContainerEl = document.getElementById('history-container');
    
    // Mode tabs for history
    const allModeTab = document.getElementById('all-mode-tab');
    const normalModeTab = document.getElementById('normal-mode-tab');
    const advancedModeTab = document.getElementById('advanced-mode-tab');
    
    // Game state
    let gameState = {
        mode: 'normal', // 'normal' or 'advanced'
        questionCount: 10,
        currentQuestion: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        startTime: null,
        endTime: null,
        timerInterval: null,
        currentNum1: null,
        currentNum2: null,
        currentResult: null,
        currentQuestionType: null, // 'normal', 'findNum2', or 'findNum1'
        historyLimit: 30,
        currentAnswer: null
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
        // Reset the UI elements first
        num1El.textContent = '?';
        num2El.textContent = '?';
        resultEl.textContent = '?';
        
        // Remove the revealed-answer class from all elements
        num1El.classList.remove('revealed-answer');
        num2El.classList.remove('revealed-answer');
        resultEl.classList.remove('revealed-answer');
        
        // Remove any feedback styling from previous question
        const questionContainer = document.querySelector('.question-container');
        questionContainer.classList.remove('correct-answer', 'incorrect-answer');
        
        // Remove any existing feedback icon
        const questionEl = document.querySelector('.question');
        const existingIcon = questionEl.querySelector('.feedback-icon');
        if (existingIcon) {
            questionEl.removeChild(existingIcon);
        }
        
        // Re-enable input and button
        answerInput.disabled = false;
        submitBtn.disabled = false;
        
        if (gameState.mode === 'normal') {
            // Normal mode: 2 x 3 = ?
            gameState.currentQuestionType = 'normal';
            gameState.currentNum1 = getRandomNumber(1, 9);
            gameState.currentNum2 = getRandomNumber(1, 9);
            gameState.currentResult = gameState.currentNum1 * gameState.currentNum2;
            gameState.currentAnswer = gameState.currentResult;
            
            num1El.textContent = gameState.currentNum1;
            num2El.textContent = gameState.currentNum2;
            resultEl.textContent = '?';
        } else {
            // Advanced mode: randomly pick between 3 question types
            const questionType = Math.random() < 0.33 ? 'normal' : Math.random() < 0.5 ? 'findNum2' : 'findNum1';
            gameState.currentQuestionType = questionType;
            
            gameState.currentNum1 = getRandomNumber(1, 9);
            gameState.currentNum2 = getRandomNumber(1, 9);
            gameState.currentResult = gameState.currentNum1 * gameState.currentNum2;
            
            if (questionType === 'normal') {
                // 2 x 3 = ?
                num1El.textContent = gameState.currentNum1;
                num2El.textContent = gameState.currentNum2;
                resultEl.textContent = '?';
                gameState.currentAnswer = gameState.currentResult;
            } else if (questionType === 'findNum2') {
                // 2 x ? = 6
                num1El.textContent = gameState.currentNum1;
                num2El.textContent = '?';
                resultEl.textContent = gameState.currentResult;
                gameState.currentAnswer = gameState.currentNum2;
            } else {
                // ? x 3 = 6
                num1El.textContent = '?';
                num2El.textContent = gameState.currentNum2;
                resultEl.textContent = gameState.currentResult;
                gameState.currentAnswer = gameState.currentNum1;
            }
        }
        
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
    
    function showFeedback(isCorrect) {
        // Update the question area with the correct answer
        if (gameState.currentQuestionType === 'normal') {
            // If it was a normal question (2 x 3 = ?), update the result
            resultEl.textContent = gameState.currentResult;
            resultEl.classList.add('revealed-answer');
        } else if (gameState.currentQuestionType === 'findNum2') {
            // If it was finding the second number (2 x ? = 6), update num2
            num2El.textContent = gameState.currentNum2;
            num2El.classList.add('revealed-answer');
        } else {
            // If it was finding the first number (? x 3 = 6), update num1
            num1El.textContent = gameState.currentNum1;
            num1El.classList.add('revealed-answer');
        }

        // Add feedback indicator to the question container
        const questionContainer = document.querySelector('.question-container');
        questionContainer.classList.remove('correct-answer', 'incorrect-answer');
        questionContainer.classList.add(isCorrect ? 'correct-answer' : 'incorrect-answer');

        // Add feedback icon next to the question
        const questionEl = document.querySelector('.question');
        const feedbackIcon = document.createElement('span');
        feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackIcon.textContent = isCorrect ? '✓' : '✗';
        
        // Remove any existing feedback icon first
        const existingIcon = questionEl.querySelector('.feedback-icon');
        if (existingIcon) {
            questionEl.removeChild(existingIcon);
        }
        
        questionEl.appendChild(feedbackIcon);
        
        // Disable the input and button temporarily
        answerInput.disabled = true;
        submitBtn.disabled = true;
    }
    
    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value, 10);
        const correctAnswer = gameState.currentAnswer;
        
        const isCorrect = userAnswer === correctAnswer;
        
        if (isCorrect) {
            gameState.correctAnswers++;
        } else {
            gameState.incorrectAnswers++;
        }
        
        showFeedback(isCorrect);
        
        gameState.currentQuestion++;
        
        // Check if game is over
        if (gameState.currentQuestion >= gameState.questionCount) {
            setTimeout(showResults, 800);
        } else {
            setTimeout(() => {
                // Re-enable input and button for the next question
                answerInput.disabled = false;
                submitBtn.disabled = false;
                generateQuestion();
            }, 800);
        }
    }
    
    // History functions
    function getHistoryKey() {
        return `practiceHistory_${gameState.mode}`;
    }
    
    function loadHistoryFromStorage(mode = null) {
        const historyKey = mode ? `practiceHistory_${mode}` : getHistoryKey();
        const storedHistory = localStorage.getItem(historyKey);
        return storedHistory ? JSON.parse(storedHistory) : [];
    }
    
    function loadAllHistoryFromStorage() {
        const normalHistory = loadHistoryFromStorage('normal');
        const advancedHistory = loadHistoryFromStorage('advanced');
        
        // Combine and sort by date (newest first)
        const combinedHistory = [...normalHistory, ...advancedHistory].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        return combinedHistory;
    }
    
    function saveHistoryToStorage(history, mode = null) {
        const historyKey = mode ? `practiceHistory_${mode}` : getHistoryKey();
        localStorage.setItem(historyKey, JSON.stringify(history));
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
    
    function clearHistory(mode = null) {
        if (mode === 'all') {
            localStorage.removeItem('practiceHistory_normal');
            localStorage.removeItem('practiceHistory_advanced');
        } else if (mode) {
            localStorage.removeItem(`practiceHistory_${mode}`);
        } else {
            localStorage.removeItem(getHistoryKey());
        }
        
        displayHistory(); // Refresh the empty history display
    }
    
    function displayHistory(mode = 'all') {
        let history;
        
        if (mode === 'all') {
            history = loadAllHistoryFromStorage();
        } else {
            history = loadHistoryFromStorage(mode);
        }
        
        historyContainerEl.innerHTML = '';
        
        if (history.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-history';
            emptyMessage.textContent = '尚無練習記錄';
            historyContainerEl.appendChild(emptyMessage);
            return;
        }

        // Add trend summary if we have more than one record and not in 'all' mode
        if (history.length > 1 && mode !== 'all') {
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
            
            // Compare with previous entry for progress indicators if they are of the same mode
            let accuracyProgress = '';
            let timeProgress = '';
            
            if (mode !== 'all' && index < history.length - 1) {
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
            
            const modeText = entry.mode === 'normal' ? '一般模式' : '進階模式';
            
            historyItem.innerHTML = `
                <div class="history-number">#${index + 1}</div>
                <div class="history-content">
                    <div class="history-date">${formattedDate}</div>
                    <div class="history-details">
                        <span>模式: ${modeText}</span>
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
        
        // Set active tab
        setActiveHistoryTab('all');
        displayHistory('all');
    }
    
    function setActiveHistoryTab(mode) {
        // Remove active class from all tabs
        allModeTab.classList.remove('active');
        normalModeTab.classList.remove('active');
        advancedModeTab.classList.remove('active');
        
        // Add active class to the selected tab
        if (mode === 'all') {
            allModeTab.classList.add('active');
        } else if (mode === 'normal') {
            normalModeTab.classList.add('active');
        } else if (mode === 'advanced') {
            advancedModeTab.classList.add('active');
        }
    }
    
    function showResults() {
        const totalTime = stopTimer();
        const accuracy = Math.round((gameState.correctAnswers / gameState.questionCount) * 100);
        
        // Update result display
        resultModeEl.textContent = gameState.mode === 'normal' ? '一般模式' : '進階模式';
        resultTotalEl.textContent = gameState.questionCount;
        resultCorrectEl.textContent = gameState.correctAnswers;
        resultIncorrectEl.textContent = gameState.incorrectAnswers;
        
        // Save result to history
        const result = {
            date: gameState.startTime.toISOString(),
            mode: gameState.mode,
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
            // Compare with the most recent previous entry of the same mode
            const prevResult = history[0];
            
            // Only compare if mode and questions count are the same
            if (prevResult.mode === gameState.mode && prevResult.questionCount === gameState.questionCount) {
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
        gameState.mode = gameModeSelect.value;
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
    
    // Load settings from localStorage if available
    function loadSettings() {
        const savedHistoryLimit = localStorage.getItem('historyLimit');
        if (savedHistoryLimit) {
            gameState.historyLimit = parseInt(savedHistoryLimit, 10);
            historyLimitSelect.value = savedHistoryLimit;
        }
        
        const savedGameMode = localStorage.getItem('gameMode');
        if (savedGameMode) {
            gameState.mode = savedGameMode;
            gameModeSelect.value = savedGameMode;
        }
    }
    
    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('historyLimit', historyLimitSelect.value);
        localStorage.setItem('gameMode', gameModeSelect.value);
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
    clearHistoryBtn.addEventListener('click', () => clearHistory('all'));
    
    // Mode tab event listeners
    allModeTab.addEventListener('click', () => {
        setActiveHistoryTab('all');
        displayHistory('all');
    });
    
    normalModeTab.addEventListener('click', () => {
        setActiveHistoryTab('normal');
        displayHistory('normal');
    });
    
    advancedModeTab.addEventListener('click', () => {
        setActiveHistoryTab('advanced');
        displayHistory('advanced');
    });
    
    // Allow only numbers in input
    answerInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Initialize
    loadSettings();
}); 