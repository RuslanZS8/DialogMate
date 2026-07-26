const userInput = document.getElementById('user-input');
const outputDiv = document.getElementById('output');
const sendButton = document.querySelector('.input-area button');

const isLocalHost =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';

const PRODUCTION_API = 'https://dialogmate.onrender.com/roast';
const PRODUCTION_HEALTH = 'https://dialogmate.onrender.com/health';

const backendUrl = isLocalHost
    ? 'http://127.0.0.1:5000/roast'
    : PRODUCTION_API;

const healthUrl = isLocalHost
    ? 'http://127.0.0.1:5000/health'
    : PRODUCTION_HEALTH;

let busy = false;

function appendMessage(html) {
    outputDiv.innerHTML += html;
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

function setBusy(state) {
    busy = state;
    if (sendButton) sendButton.disabled = state;
    if (userInput) userInput.disabled = state;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 90000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function wakeBackend() {
    try {
        await fetchWithTimeout(healthUrl, { method: 'GET' }, 90000);
    } catch (_) {
        // First wake can fail while Render starts; roast retries will handle it.
    }
}

async function sendPrompt() {
    const prompt = userInput.value.trim();
    if (!prompt || busy) return;

    appendMessage(`<p><strong>You:</strong> ${prompt}</p>`);
    userInput.value = '';
    setBusy(true);

    const statusId = `status-${Date.now()}`;
    appendMessage(
        `<p id="${statusId}" class="status">Waking up the bot (can take up to 1 min on free hosting)...</p>`
    );

    try {
        await wakeBackend();

        let lastError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const statusEl = document.getElementById(statusId);
                if (statusEl) {
                    statusEl.textContent =
                        attempt === 1
                            ? 'Sending message...'
                            : `Retrying... (attempt ${attempt}/3)`;
                }

                const response = await fetchWithTimeout(
                    backendUrl,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_prompt: prompt }),
                    },
                    90000
                );

                const statusElDone = document.getElementById(statusId);
                if (statusElDone) statusElDone.remove();

                if (!response.ok) {
                    let errorText = 'Something went wrong';
                    try {
                        const errorData = await response.json();
                        errorText = errorData.error || errorText;
                    } catch (_) {}
                    appendMessage(`<p class="error">Error: ${errorText}</p>`);
                    return;
                }

                const data = await response.json();
                appendMessage(`<p><strong>Zalush❤️:</strong> ${data.bot_response}</p>`);
                return;
            } catch (error) {
                lastError = error;
                await new Promise((r) => setTimeout(r, 2000));
            }
        }

        const statusElFail = document.getElementById(statusId);
        if (statusElFail) statusElFail.remove();

        console.error('Error sending prompt:', lastError);
        appendMessage(
            `<p class="error">Error: Could not connect to the bot. Open <a href="${PRODUCTION_HEALTH}" target="_blank" rel="noopener">this link</a> once to wake the server, wait until you see {"ok":true}, then try again.</p>`
        );
    } finally {
        setBusy(false);
    }
}

userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendPrompt();
    }
});

// Start waking the free Render server as soon as the chat page opens
if (!isLocalHost) {
    wakeBackend();
}

const numStars = 100;
const stars = [];
const speedFactor = 2;

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    const size = getRandom(1, 3);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.x = getRandom(0, window.innerWidth);
    star.y = getRandom(0, window.innerHeight);
    star.vx = getRandom(-0.2, 0.2) * speedFactor;
    star.vy = getRandom(-0.2, 0.2) * speedFactor;
    star.style.left = `${star.x}px`;
    star.style.top = `${star.y}px`;
    star.style.backgroundColor = 'white';
    star.style.borderRadius = '50%';
    star.style.position = 'fixed';
    document.body.appendChild(star);
    return star;
}

function updateStars() {
    for (const star of stars) {
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = window.innerWidth;
        if (star.x > window.innerWidth) star.x = 0;
        if (star.y < 0) star.y = window.innerHeight;
        if (star.y > window.innerHeight) star.y = 0;

        star.style.left = `${star.x}px`;
        star.style.top = `${star.y}px`;
    }
    requestAnimationFrame(updateStars);
}

for (let i = 0; i < numStars; i++) {
    stars.push(createStar());
}

updateStars();
