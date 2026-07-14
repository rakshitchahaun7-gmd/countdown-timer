document.addEventListener('DOMContentLoaded', () => {
    // Shared Elements
    const container = document.getElementById('fullscreen-container');
    const progressBar = document.getElementById('progress-bar');
    const themeBtn = document.getElementById('theme-btn');
    const themeDropdown = document.getElementById('theme-dropdown');
    const themeOptions = document.querySelectorAll('.theme-option');
    const soundBtn = document.getElementById('sound-btn');
    const tickSound = document.getElementById('tick-sound');
    const chimeSound = document.getElementById('chime-sound');
    const fullscreenBtns = document.querySelectorAll('#fullscreen-btn');

    let isSoundEnabled = false;

    // --- SOUND & THEME ---
    soundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundBtn.classList.toggle('muted', !isSoundEnabled);
        document.querySelector('.icon-muted').style.display = isSoundEnabled ? 'none' : 'block';
        document.querySelector('.icon-unmuted').style.display = isSoundEnabled ? 'block' : 'none';
        if (isSoundEnabled) {
            tickSound.volume = 0.5; chimeSound.volume = 0.8;
            tickSound.play().then(() => tickSound.pause()).catch(e => {});
        }
    });

    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); themeDropdown.classList.toggle('show');
    });
    document.addEventListener('click', () => themeDropdown.classList.remove('show'));
    themeOptions.forEach(opt => opt.addEventListener('click', () => document.body.className = opt.dataset.theme));

    function playTick() {
        if (isSoundEnabled) {
            tickSound.currentTime = 0;
            tickSound.play().catch(e => {});
        }
    }

    // --- ANIMATION UTILS ---
    function animateValue(el, newValue) {
        if (el.innerText === newValue) return;
        el.classList.add('slide-up');
        setTimeout(() => {
            el.innerText = newValue;
            el.classList.remove('slide-up');
            el.classList.add('slide-down');
            void el.offsetWidth; // Force reflow
            el.classList.remove('slide-down');
        }, 200);
    }
    function formatTime(time) { return time < 10 ? `0${time}` : String(time); }

    // --- NAVIGATION DOCK & GUIDE ---
    const navBtns = document.querySelectorAll('.nav-btn[data-target]');
    const views = document.querySelectorAll('.view-layer');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            views.forEach(v => v.classList.remove('active-view'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active-view');
        });
    });

    const guideBtn = document.getElementById('guide-btn');
    const guideModal = document.getElementById('guide-modal');
    const closeGuideBtn = document.getElementById('close-guide-btn');
    guideBtn.addEventListener('click', () => guideModal.classList.add('show'));
    closeGuideBtn.addEventListener('click', () => guideModal.classList.remove('show'));
    guideModal.addEventListener('click', (e) => { if(e.target === guideModal) guideModal.classList.remove('show'); });


    // --- COUNTDOWN LOGIC ---
    const cdEls = {
        days: document.getElementById('cd-days'), hours: document.getElementById('cd-hours'),
        minutes: document.getElementById('cd-minutes'), seconds: document.getElementById('cd-seconds')
    };
    const dateInput = document.getElementById('event-date');
    const tzInput = document.getElementById('event-tz');
    const startCdBtn = document.getElementById('start-cd-btn');
    let cdInterval, cdTarget = 0, cdStart = Date.now(), hasChimed = false;

    // --- URL PARSING & DEFAULT DATE ---
    const urlParams = new URLSearchParams(window.location.search);
    const isLaunchMode = urlParams.get('mode') === 'launch';

    if (isLaunchMode) {
        document.body.classList.add('launch-mode');
        if (urlParams.get('theme')) document.body.className = urlParams.get('theme') + ' launch-mode';
        
        document.getElementById('landing-title').innerText = urlParams.get('title') || 'WE ARE LAUNCHING';
        document.getElementById('landing-desc').innerText = urlParams.get('desc') || '';
        document.getElementById('landing-header').style.display = 'block';
        document.getElementById('landing-footer').style.display = 'block';
        
        const launchTarget = parseInt(urlParams.get('time'));
        if (launchTarget && !isNaN(launchTarget)) {
            cdTarget = launchTarget;
        } else {
            cdTarget = Date.now() + 86400000;
        }
        startCountdown();
    } else {
        const defDate = new Date(); defDate.setDate(defDate.getDate() + 1); defDate.setHours(0,0,0,0);
        dateInput.value = new Date(defDate.getTime() - defDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        cdTarget = defDate.getTime();
        startCountdown();
    }

    startCdBtn.addEventListener('click', () => {
        // Parse time with timezone
        const inputVal = dateInput.value;
        const tz = tzInput.value;
        if (inputVal) {
            if (tz === 'local') {
                cdTarget = new Date(inputVal).getTime();
            } else {
                cdTarget = moment.tz(inputVal, tz).valueOf();
            }
            cdStart = Date.now();
            hasChimed = false;
            document.querySelector('#countdown-view .timer-display').classList.remove('timer-complete');
            startCountdown();
            chimeSound.volume = 0.8;
            chimeSound.play().then(() => chimeSound.pause()).catch(e => {});
        }
    });

    function startCountdown() {
        if (cdInterval) clearInterval(cdInterval);
        updateCountdown();
        cdInterval = setInterval(updateCountdown, 1000);
    }

    function updateCountdown() {
        if(!document.getElementById('countdown-view').classList.contains('active-view')) return;
        
        const now = Date.now();
        const distance = cdTarget - now;
        
        if (cdTarget - cdStart > 0) {
            let prog = ((now - cdStart) / (cdTarget - cdStart)) * 100;
            progressBar.style.width = `${Math.min(prog, 100)}%`;
        }

        if (distance <= 0) {
            clearInterval(cdInterval);
            animateValue(cdEls.days, "00"); animateValue(cdEls.hours, "00");
            animateValue(cdEls.minutes, "00"); animateValue(cdEls.seconds, "00");
            progressBar.style.width = '100%';
            document.querySelector('#countdown-view .timer-display').classList.add('timer-complete');
            if (!hasChimed) {
                chimeSound.currentTime = 0; chimeSound.volume = 1.0;
                chimeSound.play().catch(e => {});
                hasChimed = true;
            }
            return;
        }

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        animateValue(cdEls.days, formatTime(d)); animateValue(cdEls.hours, formatTime(h));
        animateValue(cdEls.minutes, formatTime(m)); 
        const oldS = cdEls.seconds.innerText;
        const newS = formatTime(s);
        if (oldS !== newS) { animateValue(cdEls.seconds, newS); playTick(); }
    }

    // --- TIMER LOGIC ---
    const tmEls = { h: document.getElementById('tm-hours'), m: document.getElementById('tm-minutes'), s: document.getElementById('tm-seconds') };
    const tmInpH = document.getElementById('tm-input-h');
    const tmInpM = document.getElementById('tm-input-m');
    const tmInpS = document.getElementById('tm-input-s');
    
    let tmInterval, tmRemaining = 0, tmTotal = 0, tmRunning = false, tmHasChimed = false;

    function syncTimerInputs() {
        if (tmRunning) return;
        let h = parseInt(tmInpH.value) || 0; let m = parseInt(tmInpM.value) || 0; let s = parseInt(tmInpS.value) || 0;
        tmRemaining = h * 3600 + m * 60 + s; tmTotal = tmRemaining;
        updateTimerUI(tmRemaining);
    }
    tmInpH.addEventListener('input', syncTimerInputs);
    tmInpM.addEventListener('input', syncTimerInputs);
    tmInpS.addEventListener('input', syncTimerInputs);

    document.getElementById('tm-start-btn').addEventListener('click', () => {
        if (!tmRunning) {
            if (tmRemaining <= 0) syncTimerInputs();
            if (tmRemaining > 0) {
                tmRunning = true; tmHasChimed = false;
                document.querySelector('#timer-view .timer-display').classList.remove('timer-complete');
                updateTimerUI(tmRemaining);
                tmInterval = setInterval(updateTimerMode, 1000);
                chimeSound.volume = 0.8; chimeSound.play().then(() => chimeSound.pause()).catch(e => {});
            }
        }
    });

    document.getElementById('tm-pause-btn').addEventListener('click', () => { tmRunning = false; clearInterval(tmInterval); });

    document.getElementById('tm-reset-btn').addEventListener('click', () => {
        tmRunning = false; clearInterval(tmInterval);
        syncTimerInputs();
        progressBar.style.width = '0%';
        document.querySelector('#timer-view .timer-display').classList.remove('timer-complete');
    });

    function updateTimerMode() {
        if (!tmRunning) return;
        tmRemaining--;
        if (tmTotal > 0) { progressBar.style.width = `${Math.min(((tmTotal - tmRemaining) / tmTotal) * 100, 100)}%`; }
        if (tmRemaining <= 0) {
            tmRunning = false; clearInterval(tmInterval); updateTimerUI(0);
            progressBar.style.width = '100%';
            document.querySelector('#timer-view .timer-display').classList.add('timer-complete');
            if (!tmHasChimed) {
                chimeSound.currentTime = 0; chimeSound.volume = 1.0;
                chimeSound.play().catch(e => {}); tmHasChimed = true;
            }
            return;
        }
        updateTimerUI(tmRemaining);
    }

    function updateTimerUI(totalSeconds) {
        let h = Math.floor(totalSeconds / 3600); let m = Math.floor((totalSeconds % 3600) / 60); let s = totalSeconds % 60;
        animateValue(tmEls.h, formatTime(h)); animateValue(tmEls.m, formatTime(m));
        const oldS = tmEls.s.innerText; const newS = formatTime(s);
        if (oldS !== newS) { animateValue(tmEls.s, newS); if(document.getElementById('timer-view').classList.contains('active-view')) playTick(); }
    }

    // --- STOPWATCH LOGIC ---
    const swEls = { min: document.getElementById('sw-minutes'), sec: document.getElementById('sw-seconds'), ms: document.getElementById('sw-ms') };
    const swStartBtn = document.getElementById('sw-start-btn');
    const swPauseBtn = document.getElementById('sw-pause-btn');
    const swResetBtn = document.getElementById('sw-reset-btn');
    
    let swInterval;
    let swTime = 0;
    let swRunning = false;
    let swLastUpdate = 0;

    swStartBtn.addEventListener('click', () => {
        if (!swRunning) {
            swRunning = true;
            swLastUpdate = Date.now();
            swInterval = requestAnimationFrame(updateStopwatch);
            progressBar.style.width = '0%';
        }
    });

    swPauseBtn.addEventListener('click', () => { swRunning = false; cancelAnimationFrame(swInterval); });

    swResetBtn.addEventListener('click', () => {
        swRunning = false;
        cancelAnimationFrame(swInterval);
        swTime = 0;
        swEls.min.innerText = "00"; swEls.sec.innerText = "00"; swEls.ms.innerText = "00";
    });

    function updateStopwatch() {
        if (!swRunning) return;
        const now = Date.now();
        swTime += (now - swLastUpdate);
        swLastUpdate = now;

        const m = Math.floor(swTime / 60000);
        const s = Math.floor((swTime % 60000) / 1000);
        const ms = Math.floor((swTime % 1000) / 10); // 2 digits for MS

        swEls.min.innerText = formatTime(m);
        
        const newSec = formatTime(s);
        if(swEls.sec.innerText !== newSec) {
            animateValue(swEls.sec, newSec);
            playTick();
        }
        
        swEls.ms.innerText = formatTime(ms);
        swInterval = requestAnimationFrame(updateStopwatch);
    }

    // --- CLOCK LOGIC ---
    const ckEls = { h: document.getElementById('ck-hours'), m: document.getElementById('ck-minutes'), s: document.getElementById('ck-seconds'), ampm: document.getElementById('ck-ampm') };
    const clockTz = document.getElementById('clock-tz');
    
    setInterval(updateClock, 1000);
    updateClock();

    // --- LAUNCH BUILDER LOGIC ---
    document.getElementById('lb-generate-btn').addEventListener('click', () => {
        const title = document.getElementById('lb-title').value;
        const desc = document.getElementById('lb-desc').value;
        
        const inputVal = dateInput.value;
        const tz = tzInput.value;
        let targetTime = Date.now() + 86400000;
        if (inputVal) {
            if (tz === 'local') {
                targetTime = new Date(inputVal).getTime();
            } else {
                targetTime = moment.tz(inputVal, tz).valueOf();
            }
        }
        
        const theme = document.body.className.replace('launch-mode', '').trim() || 'theme-obsidian';
        
        const url = new URL(window.location.href);
        url.searchParams.set('mode', 'launch');
        if (title) url.searchParams.set('title', title);
        if (desc) url.searchParams.set('desc', desc);
        url.searchParams.set('time', targetTime);
        url.searchParams.set('theme', theme);
        
        document.getElementById('lb-result-url').value = url.toString();
        document.getElementById('lb-result-group').style.display = 'block';
    });

    document.getElementById('lb-copy-btn').addEventListener('click', () => {
        const input = document.getElementById('lb-result-url');
        input.select();
        document.execCommand('copy');
        const btn = document.getElementById('lb-copy-btn');
        btn.innerText = 'Copied!';
        setTimeout(() => btn.innerText = 'Copy', 2000);
    });

    function updateClock() {
        if(!document.getElementById('clock-view').classList.contains('active-view')) return;
        const tz = clockTz.value;
        let now;
        if (tz === 'local') {
            now = moment();
        } else {
            now = moment.tz(tz);
        }

        let h = now.format('hh');
        let m = now.format('mm');
        let s = now.format('ss');
        let ampm = now.format('A');

        animateValue(ckEls.h, h);
        animateValue(ckEls.m, m);
        const oldS = ckEls.s.innerText;
        if (oldS !== s) { animateValue(ckEls.s, s); playTick(); }
        ckEls.ampm.innerText = ampm;
    }

    // --- FULLSCREEN LOGIC ---
    fullscreenBtns.forEach(btn => btn.addEventListener('click', toggleFullscreen));
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'f' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            toggleFullscreen();
        }
    });

    function toggleFullscreen() {
        if (!document.fullscreenElement) { container.requestFullscreen().catch(e => {}); }
        else { document.exitFullscreen(); }
    }
});
