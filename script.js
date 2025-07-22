let players = [];
let currentPlayerIndex = 0;
let targetScore = 0;
let isRolling = false;
let gameWinner = null;

class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
        this.id = `player-${Math.random().toString(36).substr(2, 9)}`;
        this.highestRoll = 0;
        this.totalSixes = 0;
        this.streak = 0;
        this.lastRoll = null;
    }

    addScore(val) {
        this.score += val;
        if (val > this.highestRoll) this.highestRoll = val;
        if (val === 6) {
            this.totalSixes++;
            this.streak++;
        } else {
            this.streak = 0;
        }
    }

    hasWon() {
        return this.score >= targetScore;
    }
}

function startGame() {
    const numPlayersInput = document.getElementById('numPlayers');
    const targetScoreInput = document.getElementById('targetScore');
    const numPlayers = parseInt(numPlayersInput.value);
    targetScore = parseInt(targetScoreInput.value);

    if (!numPlayers || numPlayers < 2 || !targetScore || targetScore < 10) {
        alert("Please enter a valid number of players (at least 2) and a target score (at least 10).");
        return;
    }

    const playerInputsDiv = document.getElementById('playerInputs');
    playerInputsDiv.innerHTML = '';
    players = [];

    for (let i = 0; i < numPlayers; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Enter name for Player ${i + 1}`;
        input.classList.add('playerNameInput');
        playerInputsDiv.appendChild(input);
    }

    const btn = document.createElement('button');
    btn.textContent = "✅ Confirm Players";
    btn.onclick = confirmPlayers;
    playerInputsDiv.appendChild(btn);
}

function confirmPlayers() {
    const inputs = document.querySelectorAll('.playerNameInput');
    players = Array.from(inputs).map(input => {
        const name = input.value.trim();
        return name ? new Player(name) : null;
    });

    if (players.some(p => p === null)) {
        alert("Player names cannot be empty!");
        return;
    }

    document.querySelector('.setup').classList.add('hidden');
    document.getElementById('playerInputs').classList.add('hidden');
    document.getElementById('gameBoard').classList.remove('hidden');

    // Show controls
    document.getElementById('rollBtn').classList.remove('hidden');
    document.getElementById('rollBtn').disabled = false;
    document.getElementById('turnText').classList.remove('hidden');
    document.getElementById('leaderboard').classList.remove('hidden');
    document.getElementById('playAgainBtn').classList.add('hidden');

    currentPlayerIndex = 0;
    gameWinner = null;

    updateDisplay();
    playSound('turnSound');
}

function updateDisplay() {
    const playerDisplay = document.getElementById('playersDisplay');
    const leaderboard = document.getElementById('leaderboard');
    const turnText = document.getElementById('turnText');

    playerDisplay.innerHTML = '';

    players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'player-card';
        div.id = player.id;

        if (index === currentPlayerIndex && !gameWinner) div.classList.add('active');

        const diceContainer = document.createElement('div');
        diceContainer.className = 'dice-container';
        if (player.lastRoll !== null) {
            diceContainer.innerHTML = getDiceFace(player.lastRoll);
        }

        const playerInfo = document.createElement('div');
        playerInfo.className = 'player-info';
        playerInfo.innerHTML = `<strong>${player.name}</strong><span>Score: ${player.score}</span>`;

        if (player.streak > 1) {
            const streakCounter = document.createElement('div');
            streakCounter.className = 'streak-counter';
            streakCounter.textContent = `🔥 ${player.streak}x On a Roll!`;
            playerInfo.appendChild(streakCounter);
            div.classList.add('on-streak');
            if (player.streak === 2) playSound('streakSound');
        } else {
            div.classList.remove('on-streak');
        }

        div.appendChild(diceContainer);
        div.appendChild(playerInfo);
        playerDisplay.appendChild(div);
    });

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    if (sortedPlayers.length) {
        leaderboard.innerHTML = `🏆 Leader: <strong>${sortedPlayers[0].name}</strong> with ${sortedPlayers[0].score} points`;
        if (!gameWinner) {
            turnText.textContent = `🎯 ${players[currentPlayerIndex].name}'s turn`;
        }
    }
}

function rollDice() {
    if (isRolling) return;
    isRolling = true;

    const rollBtn = document.getElementById('rollBtn');
    rollBtn.disabled = true;
    playSound('diceSound');

    const player = players[currentPlayerIndex];
    const playerCard = document.getElementById(player.id);
    const diceContainer = playerCard.querySelector('.dice-container');

    let rollCount = 0;
    const maxRolls = 10;

    const rollInterval = setInterval(() => {
        const tempDiceVal = Math.floor(Math.random() * 6) + 1;
        diceContainer.innerHTML = getDiceFace(tempDiceVal, true);
        rollCount++;
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            finishRoll();
        }
    }, 80);
}

function finishRoll() {
    const diceVal = Math.floor(Math.random() * 6) + 1;
    const player = players[currentPlayerIndex];
    player.lastRoll = diceVal;
    player.addScore(diceVal);

    updateDisplay();

    if (player.hasWon()) {
        gameWinner = player;
        setTimeout(() => endGame(player), 500);
        return;
    }

    if (diceVal !== 6) {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    }

    setTimeout(() => {
        updateDisplay();
        displayMotivationalMessage();
        if (diceVal !== 6) playSound('turnSound');
        document.getElementById('rollBtn').disabled = false;
        isRolling = false;
    }, 1000);
}

function getDiceFace(value, isRolling = false) {
    let dots = '';
    for (let i = 0; i < value; i++) {
        dots += `<span class="dot"></span>`;
    }
    const rollingClass = isRolling ? 'dice-roll' : '';
    return `<div class="dice ${rollingClass} face-${value}">${dots}</div>`;
}

function endGame(winner) {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = `🎉 <span class="winner">${winner.name}</span> wins with ${winner.score} points! 🎉`;

    document.getElementById('rollBtn').classList.add('hidden');
    document.getElementById('playAgainBtn').classList.remove('hidden');
    document.getElementById('turnText').classList.add('hidden');

    createBalloons();
    playSound('winSound');
    playSound('applauseSound');
}

function playAgain() {
    players = [];
    currentPlayerIndex = 0;
    targetScore = 0;
    isRolling = false;
    gameWinner = null;

    document.getElementById('playersDisplay').innerHTML = '';
    document.getElementById('leaderboard').innerHTML = '';

    document.getElementById('rollBtn').classList.remove('hidden');
    document.getElementById('rollBtn').disabled = false;
    document.getElementById('playAgainBtn').classList.add('hidden');
    document.getElementById('turnText').classList.add('hidden');
    document.getElementById('leaderboard').classList.add('hidden');

    document.querySelector('.setup').classList.remove('hidden');
    document.getElementById('playerInputs').classList.remove('hidden');
    document.getElementById('gameBoard').classList.add('hidden');

    document.getElementById('numPlayers').value = '';
    document.getElementById('targetScore').value = '';
    document.getElementById('playerInputs').innerHTML = '';

    removeBalloons();
}

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

const motivationalMessages = [
    "Come on, you can do it!",
    "It's your time to shine!",
    "Big money, no whammies!",
    "Let's see a high roll!",
    "You've got this!",
    "The dice are in your favor!",
    "Fortune favors the bold!",
];

function displayMotivationalMessage() {
    const messageEl = document.getElementById('motivationalMessage');
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    messageEl.textContent = `"${message}"`;
    messageEl.classList.add('visible');
    setTimeout(() => messageEl.classList.remove('visible'), 2500);
}

function createBalloons() {
    const balloonContainer = document.body;
    for (let i = 0; i < 25; i++) {
        const balloon = document.createElement('div');
        const colors = ['magenta', 'cyan'];
        balloon.className = 'balloon ' + colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = `${Math.random() * 100}vw`;
        balloon.style.animationDelay = `${Math.random() * 1.5}s`;
        balloon.style.animationDuration = `${Math.random() * 3 + 4}s`;
        balloonContainer.appendChild(balloon);
    }
}

function removeBalloons() {
    document.querySelectorAll('.balloon').forEach(b => b.remove());
}



