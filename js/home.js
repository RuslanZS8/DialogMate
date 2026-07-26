const userInput = document.getElementById('user-input');
const outputDiv = document.getElementById('output');

// Local PC uses localhost. Phone / GitHub Pages need a public HTTPS backend.
const isLocalHost =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';

// After you deploy Flask (e.g. Render), paste that URL here:
const PRODUCTION_API = 'https://dialogmate.onrender.com/roast';

const backendUrl = isLocalHost
    ? 'http://127.0.0.1:5000/roast'
    : PRODUCTION_API;

async function sendPrompt() {
    const prompt = userInput.value.trim();
    if (!prompt) return;

    outputDiv.innerHTML += `<p><strong>You:</strong> ${prompt}</p>`;
    userInput.value = '';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_prompt: prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            outputDiv.innerHTML += `<p class="error">Error: ${errorData.error || 'Something went wrong'}</p>`;
            return;
        }

        const data = await response.json();
        outputDiv.innerHTML += `<p><strong>Zalush❤️:</strong> ${data.bot_response}</p>`;
    } catch (error) {
        console.error("Error sending prompt:", error);
        outputDiv.innerHTML += `<p class="error">Error: Could not connect to the bot.</p>`;
    }
}

userInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        sendPrompt();
    }
});

const numStars = 100;
const stars = [];
const speedFactor = 2; // Adjusted speed

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    const size = getRandom(1, 3); // Smaller stars
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.x = getRandom(0, window.innerWidth);
    star.y = getRandom(0, window.innerHeight);
    star.vx = getRandom(-0.2, 0.2) * speedFactor;
    star.vy = getRandom(-0.2, 0.2) * speedFactor;
    star.style.left = `${star.x}px`;
    star.style.top = `${star.y}px`;
    star.style.backgroundColor = 'white'; // Ensure they are visible
    star.style.borderRadius = '50%';
    star.style.position = 'fixed'; // Fixed position
    document.body.appendChild(star);
    return star;
}

function updateStars() {
    for (const star of stars) {
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
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