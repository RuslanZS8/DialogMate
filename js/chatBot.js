const numStars = 100;
const stars = [];
const speedFactor = 1;

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function createStar() {
    const star = document.createElement('div');
    star.className = 'star';
    const size = getRandom(6, 1);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.x = getRandom(0, window.innerWidth);
    star.y = getRandom(0, window.innerHeight);
    star.vx = getRandom(-0.5, 0.5) * speedFactor; // Velocity in x
    star.vy = getRandom(-0.5, 0.5) * speedFactor; // Velocity in y
    star.style.left = `${star.x}px`;
    star.style.top = `${star.y}px`;
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