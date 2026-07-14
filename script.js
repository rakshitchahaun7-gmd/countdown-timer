document.addEventListener('DOMContentLoaded', () => {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    const dateInput = document.getElementById('event-date');
    const startBtn = document.getElementById('start-btn');
    
    let countdownInterval;
    
    // Set default target date to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    
    // Format for datetime-local input (YYYY-MM-DDThh:mm)
    const formatForInput = (date) => {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    };
    
    dateInput.value = formatForInput(defaultDate);
    
    // Initialize with default date
    startCountdown(defaultDate.getTime());

    startBtn.addEventListener('click', () => {
        const targetDate = new Date(dateInput.value).getTime();
        
        if (isNaN(targetDate)) {
            alert('Please select a valid date and time.');
            return;
        }
        
        startCountdown(targetDate);
        
        // Add subtle animation to button to show it registered
        startBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            startBtn.style.transform = '';
        }, 150);
    });

    function startCountdown(targetTime) {
        // Clear existing interval if any
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        // Run immediately once, then every second
        updateTimer(targetTime);
        countdownInterval = setInterval(() => updateTimer(targetTime), 1000);
    }

    function updateTimer(targetTime) {
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
        updateElement(daysEl, formatTime(d));
        updateElement(hoursEl, formatTime(h));
        updateElement(minutesEl, formatTime(m));
        updateElement(secondsEl, formatTime(s));
    }

    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }

    // Update with animation only if value changed
    function updateElement(el, newValue) {
        if (el.innerText !== String(newValue)) {
            el.innerText = newValue;
            // Remove animation class and trigger reflow
            el.classList.remove('pop');
            void el.offsetWidth;
            // Add animation class back
            el.classList.add('pop');
        }
    }
});
