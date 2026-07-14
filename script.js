document.addEventListener('DOMContentLoaded', () => {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    const dateInput = document.getElementById('event-date');
    const startBtn = document.getElementById('start-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const container = document.getElementById('fullscreen-container');
    const controlsPanel = document.querySelector('.controls-panel');
    
    let countdownInterval;
    let targetTime = 0;
    
    // Set default target date to tomorrow
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(0, 0, 0, 0);
    
    const formatForInput = (date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };
    
    dateInput.value = formatForInput(defaultDate);
    targetTime = defaultDate.getTime();
    startCountdown();

    startBtn.addEventListener('click', () => {
        const inputTime = new Date(dateInput.value).getTime();
        if (!isNaN(inputTime)) {
            targetTime = inputTime;
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

        if (distance < 0) {
            clearInterval(countdownInterval);
            setTimerValues(0, 0, 0, 0);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimerValues(days, hours, minutes, seconds);
    }

    function setTimerValues(d, h, m, s) {
        daysEl.innerText = formatTime(d);
        hoursEl.innerText = formatTime(h);
        minutesEl.innerText = formatTime(m);
        secondsEl.innerText = formatTime(s);
    }

    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    // Fullscreen Logic
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'f') {
            // Prevent triggering if typing in the date input
            if (document.activeElement !== dateInput) {
                toggleFullscreen();
            }
        }
    });

    // Auto-hide controls after 3 seconds of inactivity
    let hideTimeout;
    const resetHideTimeout = () => {
        controlsPanel.style.opacity = '1';
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (document.activeElement !== dateInput) {
                controlsPanel.style.opacity = '0';
            }
        }, 3000);
    };

    document.addEventListener('mousemove', resetHideTimeout);
    document.addEventListener('keydown', resetHideTimeout);
    resetHideTimeout();
});
