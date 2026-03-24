// ============================================
// GAME STATE & USER MANAGEMENT
// ============================================

class GameManager {
    constructor() {
        this.currentUser = null;
        this.currentSeries = {
            playerWins: 0,
            computerWins: 0,
            rounds: []
        };
        this.choices = ["rock", "paper", "scissors"];
        this.emojiMap = {
            rock: "🪨",
            paper: "📄",
            scissors: "✂️"
        };
        this.onlineMode = false;
        this.socket = null;
        this.playerNumber = null;
        this.roomId = null;
        this.waitingWidget = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkLoggedIn();
        this.loadTheme();
        this.setupMobileOptimizations();
    }

    setupMobileOptimizations() {
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        });

        // Adjust for virtual keyboard on mobile
        window.addEventListener('focusin', () => {
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    window.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        });

        // Disable scroll bounce on iOS
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.modal')) return;
        }, { passive: true });
    }

    setupEventListeners() {
        // Auth Events
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForm('register');
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForm('login');
        });

        // Mode Selection
        document.getElementById('localModeBtn').addEventListener('click', () => this.setPlayMode('local'));
        document.getElementById('onlineModeBtn').addEventListener('click', () => this.setPlayMode('online'));
        
        this.setPlayMode('local');


        document.getElementById('loginBtn').addEventListener('click', () => {
            this.vibrate(50);
            this.login();
        });
        document.getElementById('registerBtn').addEventListener('click', () => {
            this.vibrate(50);
            this.register();
        });
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.vibrate(50);
            this.logout();
        });

        // Game Events
        document.querySelectorAll('.choice-btn').forEach(button => {
            button.addEventListener('click', () => {
                this.vibrate([50, 30, 50]); // haptic feedback
                this.playRound(button.dataset.choice);
            });
            
            // Add touch feedback for mobile
            button.addEventListener('touchstart', (e) => {
                e.target.style.opacity = '0.7';
            });
            button.addEventListener('touchend', (e) => {
                e.target.style.opacity = '1';
            });
        });

        document.getElementById('resetSeriesBtn').addEventListener('click', () => {
            this.vibrate(50);
            this.resetSeries();
        });
        document.getElementById('historyBtn').addEventListener('click', () => {
            this.vibrate(40);
            this.showHistory();
        });

        // Modal Events
        const modal = document.getElementById('historyModal');
        document.querySelector('.close').addEventListener('click', () => {
            this.vibrate(30);
            modal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        // Enter key for login
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('regPassword2').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
    }

    vibrate(pattern = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // ============================================
    // AUTHENTICATION METHODS
    // ============================================

    toggleAuthForm(form) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (form === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        } else {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        }
    }

    register() {
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const password2 = document.getElementById('regPassword2').value;
        const errorDiv = document.getElementById('registerError');

        errorDiv.textContent = '';

        if (!username || !password) {
            errorDiv.textContent = 'Riempi tutti i campi';
            return;
        }

        if (username.length < 3) {
            errorDiv.textContent = 'Username deve avere almeno 3 caratteri';
            return;
        }

        if (password.length < 6) {
            errorDiv.textContent = 'Password deve avere almeno 6 caratteri';
            return;
        }

        if (password !== password2) {
            errorDiv.textContent = 'Le password non corrispondono';
            return;
        }

        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            errorDiv.textContent = 'Username già in uso';
            return;
        }

        const newUser = {
            username,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            stats: {
                totalRounds: 0,
                wins: 0,
                losses: 0,
                draws: 0
            },
            matchHistory: []
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        this.logActivity(username, 'REGISTRATION', 'Nuovo account creato');

        // Clear and switch to login
        document.getElementById('regUsername').value = '';
        document.getElementById('regPassword').value = '';
        document.getElementById('regPassword2').value = '';
        this.toggleAuthForm('login');
        document.getElementById('loginError').textContent = 'Registrazione completata! Accedi ora.';
    }

    login() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        errorDiv.textContent = '';

        if (!username || !password) {
            errorDiv.textContent = 'Riempi tutti i campi';
            return;
        }

        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === this.hashPassword(password));

        if (!user) {
            errorDiv.textContent = 'Username o password errati';
            this.logActivity(username || 'unknown', 'LOGIN_FAILURE', 'Tentativo di accesso non riuscito');
            return;
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', username);
        this.logActivity(username, 'LOGIN', 'Accesso effettuato');
        
        // Reset series on new login
        this.resetSeries();
        this.showGameScreen();
        
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    }

    logout() {
        if (this.currentUser) {
            this.logActivity(this.currentUser.username, 'LOGOUT', 'Logout effettuato');
        }
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.resetSeries();
        this.showAuthScreen();
    }

    // ============================================
    // GAME LOGIC
    // ============================================

    playRound(playerChoice) {
        if (!this.currentUser) return;

        if (this.onlineMode) {
            this.sendOnlineMove(playerChoice);
            return;
        }

        // Check if series is already won
        if (this.currentSeries.playerWins >= 2 || this.currentSeries.computerWins >= 2) {
            alert('Serie terminata! Clicca "Nuova Serie" per ricominciare');
            return;
        }

        const computerChoice = this.getComputerChoice();
        const result = this.determineWinner(playerChoice, computerChoice);

        // Update series
        if (result === 'win') {
            this.currentSeries.playerWins++;
        } else if (result === 'lose') {
            this.currentSeries.computerWins++;
        }

        // Save round
        const roundData = {
            timestamp: new Date().toISOString(),
            playerChoice,
            computerChoice,
            result
        };
        this.currentSeries.rounds.push(roundData);

        // Update stats
        this.updatePlayerStats(result);

        // Display result
        this.displayRound(playerChoice, computerChoice, result);

        // Check if series is won
        if (this.currentSeries.playerWins >= 2) {
            this.endSeries('win');
        } else if (this.currentSeries.computerWins >= 2) {
            this.endSeries('lose');
        }
    }

    getComputerChoice() {
        const index = Math.floor(Math.random() * this.choices.length);
        return this.choices[index];
    }

    determineWinner(player, computer) {
        if (player === computer) {
            return 'draw';
        }

        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return 'win';
        }

        return 'lose';
    }

    displayRound(playerChoice, computerChoice, result) {
        // Animate moves
        const playerMoveEl = document.getElementById('playerMove');
        const computerMoveEl = document.getElementById('computerMove');
        
        playerMoveEl.style.animation = 'none';
        computerMoveEl.style.animation = 'none';
        
        // Trigger animation
        setTimeout(() => {
            playerMoveEl.style.animation = 'flip 0.8s ease-in-out';
            computerMoveEl.style.animation = 'flip 0.8s ease-in-out';
        }, 10);
        
        playerMoveEl.textContent = this.emojiMap[playerChoice];
        computerMoveEl.textContent = this.emojiMap[computerChoice];

        const resultDiv = document.getElementById('roundResult');

        if (result === 'win') {
            resultDiv.textContent = '✅ HAI VINTO QUESTO ROUND!';
            resultDiv.className = 'round-result win';
            this.createWinEffect();
        } else if (result === 'lose') {
            resultDiv.textContent = '❌ HAI PERSO QUESTO ROUND';
            resultDiv.className = 'round-result lose';
        } else {
            resultDiv.textContent = '🟡 PAREGGIO';
            resultDiv.className = 'round-result draw';
        }

        this.updateSeriesDisplay();
    }

    createWinEffect() {
        const container = document.getElementById('currentRound');
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            pointer-events: none;
            font-size: 1.5rem;
            animation: float 1s ease-out forwards;
        `;
        
        const emojis = ['🎉', '⭐', '🏆', '✨', '🎊'];
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('span');
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                animation: float ${1 + Math.random() * 0.5}s ease-out forwards;
                opacity: 1;
            `;
            container.appendChild(particle);
            setTimeout(() => particle.remove(), 1500);
        }
    }

    updateSeriesDisplay() {
        document.getElementById('playerSeriesWins').textContent = this.currentSeries.playerWins;
        document.getElementById('computerSeriesWins').textContent = this.currentSeries.computerWins;
    }

    endSeries(outcome) {
        const statusDiv = document.getElementById('seriesStatus');
        
        if (outcome === 'win') {
            statusDiv.textContent = '🏆 HAI VINTO LA SERIE! 🏆';
            this.currentSeries.winner = 'player';
            this.createCelebrationEffect();
        } else {
            statusDiv.textContent = '🤖 COMPUTER HA VINTO LA SERIE';
            this.currentSeries.winner = 'computer';
        }

        // Save series to history
        this.saveSeriesToHistory();

        // Disable buttons
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });

        // Auto-reset series after 4 seconds
        setTimeout(() => {
            this.autoResetSeries();
        }, 4000);
    }

    autoResetSeries() {
        const statusDiv = document.getElementById('seriesStatus');
        const currentText = statusDiv.textContent;
        
        // Add countdown message
        statusDiv.innerHTML = currentText + '<br><span style="font-size: 0.9em; color: #999; margin-top: 8px; display: block;">Prossima serie tra: <span id="countdown">3</span>s</span>';
        
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            const countdownEl = document.getElementById('countdown');
            if (countdownEl) {
                countdownEl.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.resetSeries();
                statusDiv.textContent = '';
            }
        }, 1000);
    }

    createCelebrationEffect() {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.style.animation = 'heartBeat 0.8s ease-in-out';
        
        // Create multiple confetti pieces
        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            const emoji = ['🎉', '🎊', '⭐', '✨', '🏆', '🎈'][Math.floor(Math.random() * 6)];
            confetti.textContent = emoji;
            confetti.style.cssText = `
                position: fixed;
                font-size: ${1 + Math.random() * 1.5}rem;
                left: ${50 + (Math.random() - 0.5) * 100}%;
                top: 10%;
                pointer-events: none;
                z-index: 999;
                animation: float ${2 + Math.random() * 1}s ease-out forwards;
                opacity: 1;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    resetSeries() {
        this.currentSeries = {
            playerWins: 0,
            computerWins: 0,
            rounds: []
        };
        
        document.getElementById('playerSeriesWins').textContent = '0';
        document.getElementById('computerSeriesWins').textContent = '0';
        document.getElementById('seriesStatus').textContent = '';
        document.getElementById('playerMove').textContent = '-';
        document.getElementById('computerMove').textContent = '-';
        document.getElementById('roundResult').textContent = '';

        // Re-enable buttons with animation
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.style.animation = 'slideInUp 0.5s ease-out';
        });
    }

    updatePlayerStats(result) {
        this.currentUser.stats.totalRounds++;
        if (result === 'win') this.currentUser.stats.wins++;
        else if (result === 'lose') this.currentUser.stats.losses++;
        else this.currentUser.stats.draws++;

        this.updateWinRateDisplay();
        this.saveCurrentUser();
    }

    saveSeriesToHistory() {
        const seriesRecord = {
            date: new Date().toISOString(),
            outcome: this.currentSeries.winner,
            playerWins: this.currentSeries.playerWins,
            computerWins: this.currentSeries.computerWins,
            rounds: this.currentSeries.rounds
        };

        this.currentUser.matchHistory.unshift(seriesRecord);
        this.currentUser.matchHistory = this.currentUser.matchHistory.slice(0, 100); // Keep last 100
        this.saveCurrentUser();
    }

    // ============================================
    // UI DISPLAY METHODS
    // ============================================

    showAuthScreen() {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('gameSection').style.display = 'none';
        this.toggleAuthForm('login');
    }

    showGameScreen() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('gameSection').style.display = 'block';
        document.getElementById('username').textContent = `👤 ${this.currentUser.username}`;
        this.updateWinRateDisplay();
    }

    updateWinRateDisplay() {
        const total = this.currentUser.stats.totalRounds;
        const wins = this.currentUser.stats.wins;
        const percentage = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
        document.getElementById('winRate').textContent = `📊 Vittorie: ${wins}/${total} (${percentage}%)`;
    }

    showHistory() {
        const modal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');

        if (this.currentUser.matchHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #999;">Nessuna partita ancora</p>';
        } else {
            historyList.innerHTML = this.currentUser.matchHistory.map((match, index) => {
                const date = new Date(match.date).toLocaleString('it-IT');
                const outcome = match.outcome === 'player' ? 'VITTORIA' : 'SCONFITTA';
                const className = match.outcome === 'player' ? 'win' : 'lose';
                return `
                    <div class="history-item" style="animation-delay: ${index * 0.1}s;">
                        <div class="result ${className}">Serie #${this.currentUser.matchHistory.length - index}: ${outcome}</div>
                        <div style="margin-top: 8px; font-size: 0.9rem;">
                            <div>Risultato: ${match.playerWins} - ${match.computerWins}</div>
                            <div>Round giocati: ${match.rounds.length}</div>
                        </div>
                        <div class="timestamp">${date}</div>
                    </div>
                `;
            }).join('');
        }

        modal.style.display = 'flex';
    }

    checkLoggedIn() {
        const username = localStorage.getItem('currentUser');
        if (username) {
            const users = this.getUsers();
            this.currentUser = users.find(u => u.username === username);
            if (this.currentUser) {
                this.showGameScreen();
                return;
            }
        }
        this.showAuthScreen();
    }

    // ============================================
    // STORAGE & UTILITY METHODS
    // ============================================

    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    saveCurrentUser() {
        const users = this.getUsers();
        const index = users.findIndex(u => u.username === this.currentUser.username);
        if (index !== -1) {
            users[index] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    hashPassword(password) {
        // Simple hash for demo - in production use proper hashing
        return btoa(password);
    }

    logActivity(username, action, details) {
        const logs = JSON.parse(localStorage.getItem('activityLog') || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            username,
            action,
            details
        });
        localStorage.setItem('activityLog', JSON.stringify(logs));
    }

    loadTheme() {
        // Can be extended for theme switching
        // Check for dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.style.colorScheme = 'dark';
        }
    }

    setPlayMode(mode) {
        this.onlineMode = (mode === 'online');
        const localBtn = document.getElementById('localModeBtn');
        const onlineBtn = document.getElementById('onlineModeBtn');
        const modeStatus = document.getElementById('modeStatus');

        localBtn.classList.toggle('active', !this.onlineMode);
        onlineBtn.classList.toggle('active', this.onlineMode);

        if (this.onlineMode) {
            modeStatus.textContent = 'Modalità online: attendi avversario...';
            this.startOnlineConnection();
        } else {
            modeStatus.textContent = 'Modalità locale';
            this.disconnectOnline();
            this.resetSeries();
        }
    }

    startOnlineConnection() {
        if (this.socket && this.socket.connected) return;

        this.socket = io();

        this.socket.on('connect', () => {
            document.getElementById('modeStatus').textContent = 'Connesso. Cercando avversario...';
            this.socket.emit('joinGame');
        });

        this.socket.on('waitingOpponent', () => {
            document.getElementById('modeStatus').textContent = 'In attesa di avversario...';
        });

        this.socket.on('matched', (roomId, playerNumber) => {
            this.roomId = roomId;
            this.playerNumber = playerNumber;
            document.getElementById('modeStatus').textContent = `Sei connesso alla stanza ${roomId} come Giocatore ${playerNumber}.`;
            this.resetSeries();
        });

        this.socket.on('roundResult', (data) => {
            // data: {playerChoice, opponentChoice, result, playerScore, opponentScore, finished, winner}
            const playerChoice = data.playerChoice;
            const computerChoice = data.opponentChoice;
            const result = data.result;

            // Show rounds as usual but with opponent label
            this.displayRound(playerChoice, computerChoice, result);

            this.currentSeries.playerWins = data.playerScore;
            this.currentSeries.computerWins = data.opponentScore;
            this.updateSeriesDisplay();

            if (data.finished) {
                const statusDiv = document.getElementById('seriesStatus');
                if (data.winner === this.playerNumber) {
                    statusDiv.textContent = '🏆 HAI VINTO LA SERIE ONLINE!';
                } else {
                    statusDiv.textContent = '🤖 AVVERSARIO HA VINTO LA SERIE';
                }
            }
        });

        this.socket.on('disconnect', () => {
            document.getElementById('modeStatus').textContent = 'Disconnesso. Controlla la connessione.';
            this.roomId = null;
            this.playerNumber = null;
        });

        this.socket.on('opponentLeft', () => {
            document.getElementById('modeStatus').textContent = 'Avversario ha lasciato. Riconnessione in corso...';
        });
    }

    disconnectOnline() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.roomId = null;
        this.playerNumber = null;
    }

    sendOnlineMove(choice) {
        if (!this.socket || !this.socket.connected || !this.roomId) {
            alert('Non sei connesso a un avversario. Riprova.');
            return;
        }

        this.socket.emit('playMove', {
            roomId: this.roomId,
            move: choice,
            playerNumber: this.playerNumber,
            username: this.currentUser ? this.currentUser.username : 'Anonym'
        });

        // mostriamo temporaneamente la mossa
        document.getElementById('modeStatus').textContent = `Hai scelto ${choice}. In attesa dell'avversario...`;
    }

    // ============================================
    // === fine metodi online ===
    // ============================================

    isMobile() {
        return window.innerWidth < 768;
    }

    isSmartphone() {
        return window.innerWidth < 480;
    }

    isLandscape() {
        return window.innerHeight < window.innerWidth;
    }
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then((registration) => {
            console.log('✅ Service Worker registrato:', registration);
        }).catch((error) => {
            console.log('⚠️ Service Worker registration fallito:', error);
        });
    }

    // PWA Install Prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
        console.log('✅ App installata come PWA');
    });
});