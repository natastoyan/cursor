let sessionData = {
    id: null,
    name: '',
    host: '',
    units: [],
    players: [],
    votes: {},
    revealed: false
};

// Add array of thinking emojis
const thinkingEmojis = ['🤔', '🫤', '🤷', '🎲', '❓', '💭', '⁉️'];

document.getElementById('sessionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const units = {
        fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89'],
        shortFibonacci: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100'],
        tshirt: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
    };

    sessionData.id = generateSessionId();
    sessionData.name = document.getElementById('sessionName').value;
    sessionData.host = document.getElementById('hostName').value;
    sessionData.units = units[document.querySelector('input[name="estimationUnit"]:checked').value];
    sessionData.players.push(sessionData.host);

    localStorage.setItem(`session_${sessionData.id}`, JSON.stringify(sessionData));

    document.getElementById('createSession').classList.add('hidden');
    initializePokerSession();
});

document.getElementById('joinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const playerName = document.getElementById('playerName').value;
    sessionData.players.push(playerName);
    
    // In a real app, you would update this on the backend
    localStorage.setItem(`session_${sessionData.id}`, JSON.stringify(sessionData));
    
    document.getElementById('joinSession').classList.add('hidden');
    initializePokerSession();
});

function initializePokerSession() {
    document.getElementById('pokerSession').classList.remove('hidden');
    document.getElementById('sessionTitle').textContent = sessionData.name;
    
    // Create cards
    const cardsContainer = document.getElementById('cardsContainer');
    cardsContainer.innerHTML = '';
    
    // Add regular cards
    sessionData.units.forEach(value => {
        const card = document.createElement('div');
        card.className = 'card';
        card.textContent = value;
        card.onclick = () => selectCard(value);
        cardsContainer.appendChild(card);
    });

    // Add random emoji card
    const randomCard = document.createElement('div');
    randomCard.className = 'card emoji-card';
    randomCard.onclick = () => selectRandomEmoji();
    randomCard.textContent = '🤔';
    cardsContainer.appendChild(randomCard);

    // Update players
    updatePlayers();
}

function selectCard(value) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.remove('selected'));
    
    const selectedCard = Array.from(cards).find(card => card.textContent === value);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        const currentPlayer = sessionData.host; // In a real app, this would be the current user
        sessionData.votes[currentPlayer] = value;
        localStorage.setItem(`session_${sessionData.id}`, JSON.stringify(sessionData));
        updatePlayers();
    }
}

function selectRandomEmoji() {
    const randomEmoji = thinkingEmojis[Math.floor(Math.random() * thinkingEmojis.length)];
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.remove('selected'));
    
    const emojiCard = document.querySelector('.emoji-card');
    emojiCard.classList.add('selected');
    emojiCard.textContent = randomEmoji;
    
    const currentPlayer = sessionData.host; // In a real app, this would be the current user
    sessionData.votes[currentPlayer] = randomEmoji;
    localStorage.setItem(`session_${sessionData.id}`, JSON.stringify(sessionData));
    updatePlayers();
}

function updatePlayers() {
    const playersContainer = document.getElementById('players');
    playersContainer.innerHTML = '';
    
    // Create players grid
    const playersGrid = document.createElement('div');
    playersGrid.className = 'players-grid';
    
    sessionData.players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-vote-card';
        if (sessionData.votes[player]) {
            playerCard.classList.add('voted');
        }
        
        const playerName = document.createElement('div');
        playerName.className = 'player-name';
        playerName.textContent = player;
        
        const voteValue = document.createElement('div');
        voteValue.className = 'vote-value';
        if (sessionData.revealed) {
            voteValue.textContent = sessionData.votes[player] || '?';
        } else if (sessionData.votes[player]) {
            voteValue.textContent = '🤔';
        } else {
            voteValue.textContent = '';
        }
        
        playerCard.appendChild(playerName);
        playerCard.appendChild(voteValue);
        playersGrid.appendChild(playerCard);
    });
    
    playersContainer.appendChild(playersGrid);
}

function generateSessionId() {
    return Math.random().toString(36).substr(2, 9);
}

document.getElementById('revealBtn').addEventListener('click', function() {
    sessionData.revealed = true;
    // In a real app, you would update this on the backend
    localStorage.setItem(`session_${sessionData.id}`, JSON.stringify(sessionData));
    revealCards();
});

document.getElementById('resetBtn').addEventListener('click', function() {
    sessionData.votes = {};
    sessionData.revealed = false;
    // In a real app, you would update this on the backend
    localStorage.setItem(`session_${sessionData.id}`, JSON.stringify(sessionData));
    updatePlayers();
});

function revealCards() {
    sessionData.revealed = true;
    updatePlayers();
    
    // Calculate and show average if using numeric values
    if (sessionData.units === 'fibonacci' || sessionData.units === 'shortFibonacci') {
        const numericVotes = Object.values(sessionData.votes).filter(vote => !isNaN(parseFloat(vote)));
        if (numericVotes.length > 0) {
            const average = numericVotes.reduce((sum, vote) => sum + parseFloat(vote), 0) / numericVotes.length;
            const sessionInfo = document.querySelector('.session-info');
            const averageDiv = document.createElement('div');
            averageDiv.textContent = `Average: ${average.toFixed(1)}`;
            sessionInfo.appendChild(averageDiv);
        }
    }
}

// Check if there's a session ID in the URL
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session');

if (sessionId) {
    // In a real app, you would fetch this from the backend
    const savedSession = localStorage.getItem(`session_${sessionId}`);
    if (savedSession) {
        sessionData = JSON.parse(savedSession);
        document.getElementById('createSession').classList.add('hidden');
        document.getElementById('joinSession').classList.remove('hidden');
    }
} 