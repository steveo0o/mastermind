class MastermindGame {
    constructor() {
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
        this.codeLength = 4;
        this.maxAttempts = 10;
        this.secretCode = [];
        this.attempts = [];
        this.currentGuess = [];
        this.currentAttemptRow = 1;
        this.selectedPeg = null;
        this.gameActive = true;
        this.allowRepeats = true;
        this.stats = this.loadStats();
        
        this.initializeElements();
        this.bindEvents();
        this.startNewGame();
        this.updateStatsDisplay();
    }

    initializeElements() {
        this.attemptsContainer = document.getElementById('attemptsContainer');
        this.submitBtn = document.getElementById('submitGuess');
        this.hintBtn = document.getElementById('hintBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.rulesBtn = document.getElementById('rulesBtn');
        this.hintModal = document.getElementById('hintModal');
        this.rulesModal = document.getElementById('rulesModal');
        this.gameEndModal = document.getElementById('gameEndModal');
        this.allowRepeatsCheckbox = document.getElementById('allowRepeats');
    }

    bindEvents() {
        // Color palette selection
        document.querySelectorAll('.color-peg').forEach(peg => {
            peg.addEventListener('click', (e) => this.selectColor(e.target.dataset.color));
        });

        // Submit guess
        this.submitBtn.addEventListener('click', () => this.submitGuess());

        // Control buttons
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.rulesBtn.addEventListener('click', () => this.showRules());
        
        // Settings
        this.allowRepeatsCheckbox.addEventListener('change', () => {
            this.allowRepeats = this.allowRepeatsCheckbox.checked;
            this.startNewGame();
        });

        // Modal controls
        document.getElementById('closeHint').addEventListener('click', () => this.closeModal('hintModal'));
        document.getElementById('closeRules').addEventListener('click', () => this.closeModal('rulesModal'));
        document.getElementById('closeGameEnd').addEventListener('click', () => this.closeModal('gameEndModal'));
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.closeModal('gameEndModal');
            this.startNewGame();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.canSubmit()) {
                this.submitGuess();
            }
            if (e.key >= '1' && e.key <= '6') {
                const colorIndex = parseInt(e.key) - 1;
                if (colorIndex < this.colors.length) {
                    this.selectColor(this.colors[colorIndex]);
                }
            }
        });
    }

    startNewGame() {
        this.secretCode = this.generateSecretCode();
        this.attempts = [];
        this.currentGuess = [null, null, null, null];
        this.currentAttemptRow = 1;
        this.selectedPeg = null;
        this.gameActive = true;
        
        // Initialize all 10 rows
        this.initializeAttemptRows();
        
        // Reset secret display
        document.querySelectorAll('.secret-peg').forEach(peg => {
            peg.textContent = '?';
            peg.style.background = '';
            peg.classList.remove('revealed');
        });
        
        // Update submit button state
        this.updateSubmitButton();
        
        this.closeModal('gameEndModal');
        console.log('Secret code:', this.secretCode); // For debugging
    }

    initializeAttemptRows() {
        this.attemptsContainer.innerHTML = '';
        for (let i = 1; i <= this.maxAttempts; i++) {
            const attemptRow = document.createElement('div');
            attemptRow.className = 'attempt-row';
            attemptRow.dataset.attemptNumber = i;
            attemptRow.innerHTML = `
                <div class="attempt-number">${i}</div>
                <div class="attempt-pegs">
                    <div class="attempt-peg empty-peg" data-position="0" data-row="${i}"></div>
                    <div class="attempt-peg empty-peg" data-position="1" data-row="${i}"></div>
                    <div class="attempt-peg empty-peg" data-position="2" data-row="${i}"></div>
                    <div class="attempt-peg empty-peg" data-position="3" data-row="${i}"></div>
                </div>
                <div class="feedback-pegs">
                    <div class="feedback-peg empty"></div>
                    <div class="feedback-peg empty"></div>
                    <div class="feedback-peg empty"></div>
                    <div class="feedback-peg empty"></div>
                </div>
            `;
            this.attemptsContainer.appendChild(attemptRow);
            
            // Add click handlers to pegs in this row
            attemptRow.querySelectorAll('.attempt-peg').forEach(peg => {
                peg.addEventListener('click', (e) => this.selectPeg(e.target));
            });
        }
        
        // Activate first row
        this.activateRow(1);
    }

    activateRow(rowNumber) {
        // Deactivate all rows
        document.querySelectorAll('.attempt-row').forEach(row => {
            row.classList.remove('active');
        });
        
        // Activate current row
        const currentRow = document.querySelector(`.attempt-row[data-attempt-number="${rowNumber}"]`);
        if (currentRow) {
            currentRow.classList.add('active');
            
            // Auto-select first peg in the row
            const firstPeg = currentRow.querySelector('.attempt-peg[data-position="0"]');
            if (firstPeg) {
                this.selectPeg(firstPeg);
            }
        }
    }

    selectPeg(pegElement) {
        if (!this.gameActive) return;
        
        const row = parseInt(pegElement.dataset.row);
        const position = parseInt(pegElement.dataset.position);
        
        // Only allow selection in the current row
        if (row !== this.currentAttemptRow) return;
        
        // Remove previous selection
        if (this.selectedPeg) {
            this.selectedPeg.classList.remove('selected');
        }
        
        // Select new peg
        this.selectedPeg = pegElement;
        pegElement.classList.add('selected');
    }

    selectColor(color) {
        if (!this.gameActive || !this.selectedPeg) return;
        
        const position = parseInt(this.selectedPeg.dataset.position);
        this.currentGuess[position] = color;
        
        // Update visual
        this.selectedPeg.style.background = this.getColorGradient(color);
        this.selectedPeg.classList.remove('empty-peg');
        this.selectedPeg.classList.add('filled');
        
        // Auto-advance to next empty peg in the row
        const nextEmptyPeg = this.findNextEmptyPeg();
        if (nextEmptyPeg) {
            this.selectPeg(nextEmptyPeg);
        } else {
            // If no empty pegs, keep current selection
            this.selectedPeg.classList.remove('selected');
            this.selectedPeg = null;
        }
        
        // Update submit button state
        this.updateSubmitButton();
    }

    findNextEmptyPeg() {
        const currentRowPegs = document.querySelectorAll(`.attempt-peg[data-row="${this.currentAttemptRow}"]`);
        for (let peg of currentRowPegs) {
            const position = parseInt(peg.dataset.position);
            if (this.currentGuess[position] === null) {
                return peg;
            }
        }
        return null;
    }

    canSubmit() {
        return this.currentGuess.every(color => color !== null);
    }

    updateSubmitButton() {
        this.submitBtn.disabled = !this.canSubmit();
    }

    generateSecretCode() {
        const code = [];
        
        if (this.allowRepeats) {
            // Allow repeating colors
            for (let i = 0; i < this.codeLength; i++) {
                code.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
            }
        } else {
            // No repeating colors - use Fisher-Yates shuffle
            const availableColors = [...this.colors];
            for (let i = 0; i < this.codeLength; i++) {
                const randomIndex = Math.floor(Math.random() * availableColors.length);
                code.push(availableColors[randomIndex]);
                availableColors.splice(randomIndex, 1);
            }
        }
        
        return code;
    }

    getColorGradient(color) {
        const gradients = {
            'red': 'linear-gradient(135deg, #ff6b6b, #ff3838)',
            'blue': 'linear-gradient(135deg, #4dabf7, #228be6)',
            'green': 'linear-gradient(135deg, #51cf66, #2f9e44)',
            'yellow': 'linear-gradient(135deg, #ffd43b, #fab005)',
            'purple': 'linear-gradient(135deg, #9775fa, #7950f2)',
            'orange': 'linear-gradient(135deg, #ff922b, #fd7e14)'
        };
        return gradients[color];
    }

    submitGuess() {
        if (!this.gameActive || !this.canSubmit()) {
            return;
        }

        const feedback = this.getFeedback(this.currentGuess);
        this.attempts.push({
            guess: [...this.currentGuess],
            feedback: feedback
        });

        this.displayAttempt(feedback);

        if (feedback.black === this.codeLength) {
            this.endGame(true);
        } else if (this.attempts.length >= this.maxAttempts) {
            this.endGame(false);
        } else {
            this.nextAttempt();
        }
    }

    getFeedback(guess) {
        let black = 0;
        let white = 0;
        const secretCopy = [...this.secretCode];
        const guessCopy = [...guess];

        // Check for black pegs (correct position)
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] === secretCopy[i]) {
                black++;
                secretCopy[i] = null;
                guessCopy[i] = null;
            }
        }

        // Check for white pegs (wrong position)
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] !== null) {
                const index = secretCopy.indexOf(guessCopy[i]);
                if (index !== -1) {
                    white++;
                    secretCopy[index] = null;
                }
            }
        }

        return { black, white };
    }

    displayAttempt(feedback) {
        const attemptRow = document.querySelector(`.attempt-row[data-attempt-number="${this.currentAttemptRow}"]`);
        
        if (attemptRow) {
            // Mark row as used
            attemptRow.classList.remove('active');
            attemptRow.classList.add('used');
            
            // Update feedback pegs
            const feedbackContainer = attemptRow.querySelector('.feedback-pegs');
            feedbackContainer.innerHTML = this.generateFeedbackPegs(feedback);
        }
    }

    generateFeedbackPegs(feedback) {
        const pegs = [];
        for (let i = 0; i < feedback.black; i++) {
            pegs.push('<div class="feedback-peg red"></div>');
        }
        for (let i = 0; i < feedback.white; i++) {
            pegs.push('<div class="feedback-peg white"></div>');
        }
        for (let i = pegs.length; i < this.codeLength; i++) {
            pegs.push('<div class="feedback-peg empty"></div>');
        }
        return pegs.join('');
    }

    nextAttempt() {
        this.currentAttemptRow++;
        this.currentGuess = [null, null, null, null];
        this.selectedPeg = null;
        this.activateRow(this.currentAttemptRow); // This will auto-select first peg
        this.updateSubmitButton();
    }

    showHint() {
        if (!this.gameActive || this.attempts.length === 0) {
            this.showMessage('Make at least one guess before requesting a hint!');
            return;
        }

        const hint = this.generateHint();
        document.getElementById('hintContent').innerHTML = hint;
        this.openModal('hintModal');
    }

    generateHint() {
        const hints = [];
        
        // Analyze patterns between attempts
        if (this.attempts.length >= 2) {
            for (let i = 0; i < this.attempts.length - 1; i++) {
                for (let j = i + 1; j < this.attempts.length; j++) {
                    const diff = this.compareAttempts(this.attempts[i], this.attempts[j]);
                    if (diff.insight) {
                        hints.push(diff.insight);
                    }
                }
            }
        }

        // Position-specific hints
        const positionHints = this.analyzePositions();
        hints.push(...positionHints);

        // Color elimination hints
        const colorHints = this.analyzeColors();
        hints.push(...colorHints);

        if (hints.length === 0) {
            hints.push("Try varying your guesses more to gather information about different colors and positions.");
        }

        return `
            <div class="hint-analysis">
                <h3>Analysis of your attempts:</h3>
                <ul>
                    ${hints.slice(0, 3).map(hint => `<li>${hint}</li>`).join('')}
                </ul>
                <p class="hint-tip">Remember: Red pegs mean correct color AND position. White pegs mean correct color but wrong position.</p>
            </div>
        `;
    }

    compareAttempts(attempt1, attempt2) {
        const changes = [];
        let samePositions = [];
        
        for (let i = 0; i < this.codeLength; i++) {
            if (attempt1.guess[i] !== attempt2.guess[i]) {
                changes.push({
                    position: i,
                    from: attempt1.guess[i],
                    to: attempt2.guess[i]
                });
            } else {
                samePositions.push(i);
            }
        }

        const blackDiff = attempt2.feedback.black - attempt1.feedback.black;
        const whiteDiff = attempt2.feedback.white - attempt1.feedback.white;

        let insight = null;

        if (changes.length === 1) {
            if (blackDiff === 1) {
                insight = `Changing position ${changes[0].position + 1} from ${changes[0].from} to ${changes[0].to} gave you an extra red peg. ${changes[0].to} is correct at position ${changes[0].position + 1}!`;
            } else if (blackDiff === -1) {
                insight = `Changing position ${changes[0].position + 1} from ${changes[0].from} to ${changes[0].to} lost a red peg. ${changes[0].from} was correct at position ${changes[0].position + 1}!`;
            } else if (whiteDiff === 1 && blackDiff === 0) {
                insight = `${changes[0].to} is in the code but not at position ${changes[0].position + 1}.`;
            }
        }

        if (changes.length === 2 && changes[0].from === changes[1].to && changes[0].to === changes[1].from) {
            if (blackDiff === 2) {
                insight = `Swapping positions ${changes[0].position + 1} and ${changes[1].position + 1} gave you 2 more red pegs. Both colors are now in their correct positions!`;
            } else if (blackDiff === -2) {
                insight = `Swapping positions ${changes[0].position + 1} and ${changes[1].position + 1} lost 2 red pegs. Both colors were in their correct positions before!`;
            }
        }

        return { changes, blackDiff, whiteDiff, insight };
    }

    analyzePositions() {
        const hints = [];
        const positionData = {};
        
        for (let pos = 0; pos < this.codeLength; pos++) {
            positionData[pos] = {};
            this.attempts.forEach(attempt => {
                const color = attempt.guess[pos];
                if (!positionData[pos][color]) {
                    positionData[pos][color] = [];
                }
                positionData[pos][color].push(attempt.feedback);
            });
        }

        // Look for confirmed positions
        for (let pos = 0; pos < this.codeLength; pos++) {
            for (let color in positionData[pos]) {
                const feedbacks = positionData[pos][color];
                if (feedbacks.length >= 2) {
                    const avgBlack = feedbacks.reduce((sum, f) => sum + f.black, 0) / feedbacks.length;
                    if (avgBlack > feedbacks[0].black) {
                        hints.push(`Position ${pos + 1} seems more likely to be ${color} based on your attempts.`);
                    }
                }
            }
        }

        return hints;
    }

    analyzeColors() {
        const hints = [];
        const colorCounts = {};
        
        this.colors.forEach(color => {
            colorCounts[color] = {
                appearances: 0,
                totalFeedback: 0
            };
        });

        this.attempts.forEach(attempt => {
            const colorFreq = {};
            attempt.guess.forEach(color => {
                colorFreq[color] = (colorFreq[color] || 0) + 1;
            });
            
            for (let color in colorFreq) {
                colorCounts[color].appearances += colorFreq[color];
                colorCounts[color].totalFeedback += attempt.feedback.black + attempt.feedback.white;
            }
        });

        // Find colors that never contributed to feedback
        for (let color in colorCounts) {
            if (colorCounts[color].appearances > 2 && colorCounts[color].totalFeedback === 0) {
                hints.push(`${color} doesn't appear to be in the secret code based on your attempts.`);
            }
        }

        return hints;
    }

    endGame(won) {
        this.gameActive = false;
        this.revealSecretCode();
        
        // Update stats
        this.stats.gamesPlayed++;
        this.stats.totalAttempts += this.attempts.length;
        if (won) {
            this.stats.wins++;
            if (!this.stats.bestScore || this.attempts.length < this.stats.bestScore) {
                this.stats.bestScore = this.attempts.length;
            }
        }
        this.saveStats();
        this.updateStatsDisplay();

        // Show end game modal
        const title = won ? 'Congratulations!' : 'Game Over';
        const message = won 
            ? `You broke the code in ${this.attempts.length} ${this.attempts.length === 1 ? 'attempt' : 'attempts'}!`
            : `The secret code was revealed. Better luck next time!`;
        
        document.getElementById('gameEndTitle').textContent = title;
        document.getElementById('gameEndContent').innerHTML = `
            <p class="${won ? 'win-message' : 'lose-message'}">${message}</p>
            <div class="secret-reveal">
                ${this.secretCode.map(color => `<div class="reveal-peg" style="background: ${this.getColorGradient(color)}"></div>`).join('')}
            </div>
            <p>Your attempts: ${this.attempts.length}/${this.maxAttempts}</p>
        `;
        
        setTimeout(() => this.openModal('gameEndModal'), 500);
    }

    revealSecretCode() {
        document.querySelectorAll('.secret-peg').forEach((peg, index) => {
            peg.textContent = '';
            peg.style.background = this.getColorGradient(this.secretCode[index]);
            peg.classList.add('revealed');
        });
    }

    loadStats() {
        const saved = localStorage.getItem('mastermindStats');
        return saved ? JSON.parse(saved) : {
            gamesPlayed: 0,
            wins: 0,
            totalAttempts: 0,
            bestScore: null
        };
    }

    saveStats() {
        localStorage.setItem('mastermindStats', JSON.stringify(this.stats));
    }

    updateStatsDisplay() {
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('avgAttempts').textContent = 
            this.stats.wins > 0 ? (this.stats.totalAttempts / this.stats.wins).toFixed(1) : '-';
        document.getElementById('bestScore').textContent = this.stats.bestScore || '-';
    }

    showRules() {
        this.openModal('rulesModal');
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MastermindGame();
});
