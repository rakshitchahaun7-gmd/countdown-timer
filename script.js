document.addEventListener('DOMContentLoaded', () => {
    const els = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };
    
    const dateInput = document.getElementById('event-date');
    const startBtn = document.getElementById('start-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const container = document.getElementById('fullscreen-container');
    const controlsPanel = document.querySelector('.controls-panel');
    const progressBar = document.getElementById('progress-bar');
    
    const themeBtn = document.getElementById('theme-btn');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    const soundBtn = document.getElementById('sound-btn');
    
    const tickSound = document.getElementById('tick-sound');
    const chimeSound = document.getElementById('chime-sound');
    
    let countdownInterval;
    let targetTime = 0;
    let startTime = new Date().getTime();
    let isSoundEnabled = false;
    let hasChimed = false;
    
    // Initialize Default Date
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(0, 0, 0, 0);
    dateInput.value = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    targetTime = defaultDate.getTime();
    
    startCountdown();

    startBtn.addEventListener('click', () => {
        const inputTime = new Date(dateInput.value).getTime();
        if (!isNaN(inputTime)) {
            targetTime = inputTime;
            startTime = new Date().getTime(); // Reset progress
            hasChimed = false;
            startCountdown();
        }
    });

    function startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetTime - now;

        // Progress Bar Calculation
        const totalDuration = targetTime - startTime;
        if (totalDuration > 0) {
            let progress = ((now - startTime) / totalDuration) * 100;
            if (progress > 100) progress = 100;
            progressBar.style.width = `${progress}%`;
        }

        if (distance <= 0) {
            clearInterval(countdownInterval);
            setTimerValues(0, 0, 0, 0);
            progressBar.style.width = '100%';
            if (isSoundEnabled && !hasChimed) {
                chimeSound.play().catch(e => console.log('Audio play failed:', e));
                hasChimed = true;
            }
            return;
        }

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        setTimerValues(d, h, m, s);
    }

    function setTimerValues(d, h, m, s) {
        animateValue(els.days, formatTime(d));
        animateValue(els.hours, formatTime(h));
        animateValue(els.minutes, formatTime(m));
        
        const oldSec = els.seconds.innerText;
        const newSec = formatTime(s);
        if (oldSec !== newSec) {
            animateValue(els.seconds, newSec);
            if (isSoundEnabled) {
                tickSound.currentTime = 0;
                tickSound.play().catch(e => console.log('Audio play failed:', e));
            }
        }
    }

    function formatTime(time) {
        return time < 10 ? `0${time}` : String(time);
    }

    function animateValue(el, newValue) {
        if (el.innerText === newValue) return;
        
        el.classList.add('slide-up');
        
        setTimeout(() => {
            el.innerText = newValue;
            el.classList.remove('slide-up');
            el.classList.add('slide-down');
            
            // Force reflow
            void el.offsetWidth;
            
            el.classList.remove('slide-down');
        }, 200); // Wait half of the transition duration
    }

    // Sound Toggle
    soundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundBtn.classList.toggle('muted', !isSoundEnabled);
        document.querySelector('.icon-muted').style.display = isSoundEnabled ? 'none' : 'block';
        document.querySelector('.icon-unmuted').style.display = isSoundEnabled ? 'block' : 'none';
        
        // Trick to unlock audio on iOS/Safari by playing a silent sound on click
        if (isSoundEnabled) {
            tickSound.volume = 0.5;
            chimeSound.volume = 0.8;
            tickSound.play().then(() => tickSound.pause()).catch(e => {});
        }
    });

    // Theme Logic
    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        themeDropdown.classList.remove('show');
    });

    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            document.body.className = option.dataset.theme;
        });
    });

    // Fullscreen Logic
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'f' && document.activeElement !== dateInput) {
            toggleFullscreen();
        }
    });

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen();
        }
    }

    // Auto-hide controls
    let hideTimeout;
    const resetHideTimeout = () => {
        controlsPanel.classList.add('force-show');
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (document.activeElement !== dateInput) {
                controlsPanel.classList.remove('force-show');
            }
        }, 3000);
    };

    document.addEventListener('mousemove', resetHideTimeout);
    document.addEventListener('keydown', resetHideTimeout);
    resetHideTimeout();
});
