// YouTube Player Global Variables
let youtubePlayer = null;
let isYouTubeReady = false;

// YouTube API Ready Callback
function onYouTubeIframeAPIReady() {
    isYouTubeReady = true;
    console.log('YouTube API is ready');
}

class ZenTimer {
    constructor() {
        this.timerInterval = null;
        this.totalTime = 0;
        this.timeLeft = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.currentTimerType = 'pomodoro';
        
        // Music player state
        this.currentVideoId = null;
        this.isPlaying = false;
        this.currentVolume = 30;
        
        // Pomodoro state
        this.pomodoroSession = 1;
        this.isWorkSession = true;
        this.workMinutes = 25;
        this.shortBreakMinutes = 5;
        this.longBreakMinutes = 15;
        
        // Interval state
        this.currentRound = 1;
        this.totalRounds = 8;
        this.isWorkInterval = true;
        this.workIntervalSeconds = 30;
        this.restIntervalSeconds = 10;
        
        this.initializeElements();
        this.bindEvents();
        this.updateIntervalTime();
    }

    initializeElements() {
        this.elements = {
            // Navigation
            backBtn: document.getElementById('back-btn'),
            statsBtn: document.getElementById('stats-btn'),
            
            // Tabs
            tabBtns: document.querySelectorAll('.tab-btn'),
            timerContents: document.querySelectorAll('.timer-content'),
            
            // Pomodoro elements
            workMinutesInput: document.getElementById('work-minutes'),
            shortBreakInput: document.getElementById('short-break'),
            longBreakInput: document.getElementById('long-break'),
            currentSession: document.getElementById('current-session'),
            sessionCount: document.getElementById('session-count'),
            
            // Custom timer elements
            customMinutes: document.getElementById('custom-minutes'),
            customSeconds: document.getElementById('custom-seconds'),
            quickBtns: document.querySelectorAll('.quick-btn'),
            
            // Preset elements
            presetCards: document.querySelectorAll('.preset-card'),
            
            // Interval elements
            workInterval: document.getElementById('work-interval'),
            restInterval: document.getElementById('rest-interval'),
            intervalRounds: document.getElementById('interval-rounds'),
            totalIntervalTime: document.getElementById('total-interval-time'),
            
            // Timer display elements
            timerSelection: document.querySelector('.timer-selection'),
            timerDisplay: document.getElementById('timer-display'),
            timerComplete: document.getElementById('timer-complete'),
            displayTimerName: document.getElementById('display-timer-name'),
            timerStatus: document.getElementById('timer-status'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            minutesDisplay: document.getElementById('minutes-display'),
            secondsDisplay: document.getElementById('seconds-display'),
            
            // Control buttons
            startTimer: document.getElementById('start-timer'),
            pauseTimer: document.getElementById('pause-timer'),
            pauseIcon: document.querySelector('.pause-icon'),
            playIcon: document.querySelector('.play-icon'),
            resetTimer: document.getElementById('reset-timer'),
            stopTimer: document.getElementById('stop-timer'),
            
            // Session info
            sessionInfo: document.getElementById('session-info'),
            currentRound: document.getElementById('current-round'),
            totalRoundsDisplay: document.getElementById('total-rounds'),
            
            // Complete screen
            completeTitle: document.getElementById('complete-title'),
            completeMessage: document.getElementById('complete-message'),
            startNext: document.getElementById('start-next'),
            newTimer: document.getElementById('new-timer'),
            
            // Share buttons
            shareTwitter: document.getElementById('share-twitter'),
            shareFacebook: document.getElementById('share-facebook'),
            
            // Music controls
            musicOptions: document.querySelectorAll('.music-option'),
            playPauseBtn: document.getElementById('play-pause-btn'),
            musicPlayIcon: document.querySelector('#play-pause-btn .play-icon'),
            musicPauseIcon: document.querySelector('#play-pause-btn .pause-icon'),
            volumeSlider: document.getElementById('volume-slider'),
            volumeText: document.querySelector('.volume-text'),
            currentTrackName: document.getElementById('current-track-name')
        };
    }

    bindEvents() {
        // Tab switching
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Quick time buttons
        this.elements.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setQuickTime(parseInt(btn.dataset.minutes)));
        });

        // Preset cards
        this.elements.presetCards.forEach(card => {
            card.addEventListener('click', () => this.selectPreset(card));
        });

        // Interval time calculation
        [this.elements.workInterval, this.elements.restInterval, this.elements.intervalRounds].forEach(input => {
            input.addEventListener('input', () => this.updateIntervalTime());
        });

        // Timer controls
        this.elements.startTimer.addEventListener('click', () => this.startTimer());
        this.elements.pauseTimer.addEventListener('click', () => this.togglePause());
        this.elements.resetTimer.addEventListener('click', () => this.resetTimer());
        this.elements.stopTimer.addEventListener('click', () => this.stopTimer());
        
        // Navigation buttons
        this.elements.backBtn.addEventListener('click', () => this.goBack());
        this.elements.statsBtn.addEventListener('click', () => this.showStats());
        
        // Complete screen buttons
        this.elements.startNext.addEventListener('click', () => this.startNextSession());
        this.elements.newTimer.addEventListener('click', () => this.showTimerSelection());
        
        // Share buttons
        this.elements.shareTwitter.addEventListener('click', () => this.shareOnTwitter());
        this.elements.shareFacebook.addEventListener('click', () => this.shareOnFacebook());
        
        // Music controls
        this.elements.musicOptions.forEach(option => {
            option.addEventListener('click', () => this.selectMusic(option));
        });
        this.elements.playPauseBtn.addEventListener('click', () => this.toggleMusic());
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Initialize YouTube player when API is ready
        this.initializeYouTubePlayer();
    }

    switchTab(tabName) {
        // Update active tab
        this.elements.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update active content
        this.elements.timerContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName + '-content');
        });

        this.currentTimerType = tabName;
    }

    setQuickTime(minutes) {
        this.elements.customMinutes.value = minutes;
        this.elements.customSeconds.value = 0;
    }

    selectPreset(card) {
        // Remove previous selection
        this.elements.presetCards.forEach(c => c.classList.remove('selected'));
        
        // Select current card
        card.classList.add('selected');
        
        // Store preset data
        this.selectedPreset = {
            minutes: parseInt(card.dataset.minutes),
            name: card.dataset.name
        };
    }

    updateIntervalTime() {
        const work = parseInt(this.elements.workInterval.value) || 30;
        const rest = parseInt(this.elements.restInterval.value) || 10;
        const rounds = parseInt(this.elements.intervalRounds.value) || 8;
        
        const totalSeconds = (work + rest) * rounds;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        this.elements.totalIntervalTime.textContent = 
            `${minutes} min ${seconds} sec`;
    }

    startTimer() {
        let timerName = '';
        let timeInSeconds = 0;
        let statusText = '';

        switch (this.currentTimerType) {
            case 'pomodoro':
                this.workMinutes = parseInt(this.elements.workMinutesInput.value) || 25;
                this.shortBreakMinutes = parseInt(this.elements.shortBreakInput.value) || 5;
                this.longBreakMinutes = parseInt(this.elements.longBreakInput.value) || 15;
                
                timeInSeconds = this.workMinutes * 60;
                timerName = 'Pomodoro Timer';
                statusText = 'Work Time';
                this.isWorkSession = true;
                this.pomodoroSession = 1;
                break;

            case 'custom':
                const minutes = parseInt(this.elements.customMinutes.value) || 0;
                const seconds = parseInt(this.elements.customSeconds.value) || 0;
                timeInSeconds = minutes * 60 + seconds;
                timerName = 'Custom Timer';
                statusText = `${minutes}m ${seconds}s`;
                break;

            case 'preset':
                if (!this.selectedPreset) {
                    this.showNotification('Please select a preset timer first.', 'warning');
                    return;
                }
                timeInSeconds = this.selectedPreset.minutes * 60;
                timerName = this.selectedPreset.name;
                statusText = `${this.selectedPreset.minutes} minutes`;
                break;

            case 'interval':
                this.workIntervalSeconds = parseInt(this.elements.workInterval.value) || 30;
                this.restIntervalSeconds = parseInt(this.elements.restInterval.value) || 10;
                this.totalRounds = parseInt(this.elements.intervalRounds.value) || 8;
                
                timeInSeconds = this.workIntervalSeconds;
                timerName = 'Interval Timer';
                statusText = 'Work Time';
                this.currentRound = 1;
                this.isWorkInterval = true;
                
                // Show session info for interval timer
                this.elements.sessionInfo.style.display = 'block';
                this.elements.currentRound.textContent = this.currentRound;
                this.elements.totalRoundsDisplay.textContent = this.totalRounds;
                break;
        }

        if (timeInSeconds <= 0) {
            this.showNotification('Please set a valid time duration.', 'warning');
            return;
        }

        this.totalTime = timeInSeconds;
        this.timeLeft = timeInSeconds;
        this.isRunning = true;
        this.isPaused = false;

        this.showTimerDisplay(timerName, statusText);
        this.updateDisplay();
        this.startCountdown();
    }

    showTimerDisplay(timerName, statusText) {
        this.elements.timerSelection.style.display = 'none';
        this.elements.timerDisplay.style.display = 'block';
        this.elements.timerDisplay.classList.add('fade-in');
        this.elements.backBtn.style.display = 'flex';
        
        this.elements.displayTimerName.textContent = timerName;
        this.elements.timerStatus.textContent = statusText;
        
        // Hide session info by default
        this.elements.sessionInfo.style.display = 'none';
    }

    startCountdown() {
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.updateDisplay();
                
                if (this.timeLeft <= 0) {
                    this.handleTimerComplete();
                }
            }
        }, 1000);
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.elements.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.elements.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        
        // Update progress bar
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.elements.progressFill.style.width = progress + '%';
        this.elements.progressText.textContent = Math.round(progress) + '%';
        
        // Add pulse effect when time is running low
        if (this.timeLeft <= 10) {
            this.elements.timerDisplay.classList.add('pulse');
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.elements.pauseIcon.style.display = 'none';
            this.elements.playIcon.style.display = 'inline';
        } else {
            this.elements.pauseIcon.style.display = 'inline';
            this.elements.playIcon.style.display = 'none';
        }
    }

    resetTimer() {
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.elements.progressFill.style.width = '0%';
        this.elements.timerDisplay.classList.remove('pulse');
    }

    stopTimer() {
        this.showTimerSelection();
    }

    handleTimerComplete() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        
        // Play notification sound
        this.playNotificationSound();
        
        // Show browser notification
        this.showNotification();
        
        if (this.currentTimerType === 'pomodoro') {
            this.handlePomodoroComplete();
        } else if (this.currentTimerType === 'interval') {
            this.handleIntervalComplete();
        } else {
            this.showTimerComplete('Timer Complete!', 'Great job! Take a well-deserved break.');
        }
    }

    handlePomodoroComplete() {
        if (this.isWorkSession) {
            // Work session completed
            if (this.pomodoroSession % 4 === 0) {
                // Start long break
                this.showTimerComplete('Work Complete!', 'Time for a long break', 'long-break');
            } else {
                // Start short break
                this.showTimerComplete('Work Complete!', 'Take a short break', 'short-break');
            }
        } else {
            // Break session completed
            if (this.pomodoroSession >= 4) {
                // All sessions completed
                this.showTimerComplete('Pomodoro Complete!', 'You\'ve completed all 4 sessions!');
            } else {
                // Start next work session
                this.pomodoroSession++;
                this.showTimerComplete('Break Complete!', 'Ready for your next work session?', 'work');
            }
        }
    }

    handleIntervalComplete() {
        if (this.isWorkInterval) {
            // Work interval completed
            if (this.currentRound < this.totalRounds) {
                this.showTimerComplete('Work Complete!', 'Time to rest', 'rest');
            } else {
                // All rounds completed
                this.showTimerComplete('Workout Complete!', 'You\'ve finished all rounds!');
            }
        } else {
            // Rest interval completed
            this.currentRound++;
            this.showTimerComplete('Rest Complete!', 'Ready for the next round?', 'work');
        }
    }

    showTimerComplete(title, message, nextSession = null) {
        this.elements.timerDisplay.style.display = 'none';
        this.elements.timerComplete.style.display = 'block';
        this.elements.timerComplete.classList.add('fade-in');
        
        this.elements.completeTitle.textContent = title;
        this.elements.completeMessage.textContent = message;
        
        // Show/hide next session button
        if (nextSession) {
            this.elements.startNext.style.display = 'block';
            this.nextSessionType = nextSession;
        } else {
            this.elements.startNext.style.display = 'none';
        }
    }

    startNextSession() {
        if (this.currentTimerType === 'pomodoro') {
            if (this.nextSessionType === 'short-break') {
                this.totalTime = this.shortBreakMinutes * 60;
                this.elements.timerStatus.textContent = 'Short Break';
                this.isWorkSession = false;
            } else if (this.nextSessionType === 'long-break') {
                this.totalTime = this.longBreakMinutes * 60;
                this.elements.timerStatus.textContent = 'Long Break';
                this.isWorkSession = false;
            } else if (this.nextSessionType === 'work') {
                this.totalTime = this.workMinutes * 60;
                this.elements.timerStatus.textContent = 'Work Time';
                this.isWorkSession = true;
                this.elements.sessionCount.textContent = this.pomodoroSession;
            }
        } else if (this.currentTimerType === 'interval') {
            if (this.nextSessionType === 'rest') {
                this.totalTime = this.restIntervalSeconds;
                this.elements.timerStatus.textContent = 'Rest Time';
                this.isWorkInterval = false;
            } else if (this.nextSessionType === 'work') {
                this.totalTime = this.workIntervalSeconds;
                this.elements.timerStatus.textContent = 'Work Time';
                this.isWorkInterval = true;
                this.elements.currentRound.textContent = this.currentRound;
            }
        }
        
        this.timeLeft = this.totalTime;
        this.isRunning = true;
        this.isPaused = false;
        
        this.elements.timerComplete.style.display = 'none';
        this.elements.timerDisplay.style.display = 'block';
        this.elements.timerDisplay.classList.remove('fade-in', 'pulse');
        
        this.updateDisplay();
        this.startCountdown();
    }

    showTimerSelection() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isPaused = false;
        
        this.elements.timerDisplay.style.display = 'none';
        this.elements.timerComplete.style.display = 'none';
        this.elements.timerSelection.style.display = 'block';
        this.elements.backBtn.style.display = 'none';
        
        // Reset UI
        this.elements.pauseIcon.style.display = 'inline';
        this.elements.playIcon.style.display = 'none';
        this.elements.timerDisplay.classList.remove('fade-in', 'pulse');
        this.elements.timerComplete.classList.remove('fade-in');
        
        // Reset preset selection
        this.elements.presetCards.forEach(card => card.classList.remove('selected'));
        this.selectedPreset = null;
        
        // Reset progress
        this.elements.progressFill.style.width = '0%';
        this.elements.progressText.textContent = '0%';
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Could not play notification sound');
        }
    }

    showNotification(message, type = 'info') {
        // Show browser notification for timer completion
        if (type === 'info' && 'Notification' in window && Notification.permission === 'granted') {
            let title = 'ZenTimer';
            let body = 'Timer completed!';
            
            if (this.currentTimerType === 'pomodoro') {
                body = this.isWorkSession ? 'Work session completed! Time for a break 🧘‍♀️' : 'Break session completed! Ready to focus again? 🎯';
            } else if (this.currentTimerType === 'interval') {
                body = this.isWorkInterval ? 'Work interval completed! Take a rest 💪' : 'Rest interval completed! Let\'s go again! 🔥';
            }
            
            new Notification(title, {
                body: body,
                icon: '/favicon.ico'
            });
        }
        
        // Show in-app notification
        this.showInAppNotification(message, type);
    }
    
    showInAppNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'warning' ? '#f59e0b' : '#10b981'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    goBack() {
        if (this.isRunning) {
            this.showTimerSelection();
        }
    }
    
    showStats() {
        // Placeholder for stats functionality
        this.showInAppNotification('Stats feature coming soon!', 'info');
    }
    
    shareOnTwitter() {
        const text = encodeURIComponent(`Just achieved deep focus with ZenTimer! 🧘‍♀️🎵 Perfect blend of Pomodoro technique and ambient sounds: `);
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    }
    
    shareOnFacebook() {
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
    
    // YouTube Player Methods
    initializeYouTubePlayer() {
        const checkAPIReady = () => {
            if (isYouTubeReady) {
                youtubePlayer = new YT.Player('youtube-player', {
                    height: '0',
                    width: '0',
                    playerVars: {
                        'playsinline': 1,
                        'controls': 0,
                        'disablekb': 1,
                        'fs': 0,
                        'modestbranding': 1,
                        'rel': 0
                    },
                    events: {
                        'onReady': (event) => {
                            console.log('YouTube player ready');
                            event.target.setVolume(this.currentVolume);
                        },
                        'onStateChange': (event) => {
                            this.onPlayerStateChange(event);
                        }
                    }
                });
            } else {
                setTimeout(checkAPIReady, 100);
            }
        };
        checkAPIReady();
    }
    
    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.updatePlayPauseButton();
        } else if (event.data === YT.PlayerState.PAUSED) {
            this.isPlaying = false;
            this.updatePlayPauseButton();
        }
    }
    
    selectMusic(option) {
        // Remove active class from all options
        this.elements.musicOptions.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to selected option
        option.classList.add('active');
        
        // Get video info
        const videoId = option.dataset.videoId;
        const musicName = option.dataset.name;
        
        // Update current track display
        this.elements.currentTrackName.textContent = `🎵 ${musicName}`;
        
        // Load video if player is ready
        if (youtubePlayer && youtubePlayer.loadVideoById) {
            youtubePlayer.loadVideoById(videoId);
            this.currentVideoId = videoId;
            
            // Auto-play if music was already playing
            if (this.isPlaying) {
                setTimeout(() => {
                    youtubePlayer.playVideo();
                }, 1000);
            }
        }
    }
    
    toggleMusic() {
        if (!youtubePlayer || !this.currentVideoId) {
            this.showInAppNotification('Please select a soundtrack first', 'warning');
            return;
        }
        
        if (this.isPlaying) {
            youtubePlayer.pauseVideo();
        } else {
            youtubePlayer.playVideo();
        }
    }
    
    updatePlayPauseButton() {
        if (this.isPlaying) {
            this.elements.musicPlayIcon.style.display = 'none';
            this.elements.musicPauseIcon.style.display = 'inline';
        } else {
            this.elements.musicPlayIcon.style.display = 'inline';
            this.elements.musicPauseIcon.style.display = 'none';
        }
    }
    
    setVolume(volume) {
        this.currentVolume = volume;
        this.elements.volumeText.textContent = volume + '%';
        
        if (youtubePlayer && youtubePlayer.setVolume) {
            youtubePlayer.setVolume(volume);
        }
    }
    
    handleKeyboardShortcuts(e) {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (this.isRunning) {
                    this.togglePause();
                } else {
                    this.startTimer();
                }
                break;
            case 'KeyR':
                if (this.isRunning) {
                    e.preventDefault();
                    this.resetTimer();
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.goBack();
                break;
            case 'Digit1':
                if (!this.isRunning) {
                    e.preventDefault();
                    this.switchTab('pomodoro');
                }
                break;
            case 'Digit2':
                if (!this.isRunning) {
                    e.preventDefault();
                    this.switchTab('custom');
                }
                break;
            case 'Digit3':
                if (!this.isRunning) {
                    e.preventDefault();
                    this.switchTab('preset');
                }
                break;
            case 'Digit4':
                if (!this.isRunning) {
                    e.preventDefault();
                    this.switchTab('interval');
                }
                break;
            case 'KeyM':
                e.preventDefault();
                this.toggleMusic();
                break;
        }
    }
}

// Particle animation system
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.init();
    }

    init() {
        this.createParticleContainer();
        this.generateParticles();
        this.animate();
    }

    createParticleContainer() {
        const container = document.createElement('div');
        container.className = 'particles';
        document.body.appendChild(container);
        this.container = container;
    }

    generateParticles() {
        for (let i = 0; i < 30; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 6 + 's';
        
        // Random size
        const size = Math.random() * 3 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    animate() {
        // Add floating animation with random movement
        setInterval(() => {
            this.particles.forEach(particle => {
                const currentLeft = parseFloat(particle.style.left);
                const currentTop = parseFloat(particle.style.top);
                
                // Subtle random movement
                const newLeft = currentLeft + (Math.random() - 0.5) * 0.3;
                const newTop = currentTop + (Math.random() - 0.5) * 0.3;
                
                // Keep particles within bounds
                particle.style.left = Math.max(0, Math.min(100, newLeft)) + '%';
                particle.style.top = Math.max(0, Math.min(100, newTop)) + '%';
            });
        }, 3000);
    }
}

// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme();
        this.addThemeToggle();
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('zentimer-theme');
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('zentimer-theme', this.currentTheme);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
    }

    addThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        
        themeToggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            z-index: 1000;
        `;

        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
            themeToggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        });

        document.body.appendChild(themeToggle);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timer = new ZenTimer();
    
    // Initialize particle system
    new ParticleSystem();
    
    // Initialize theme manager
    new ThemeManager();
    
    // Add gradient text effect to title
    const title = document.querySelector('.title');
    if (title) {
        title.classList.add('gradient-text');
    }
    
    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});