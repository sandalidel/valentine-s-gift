function navigate(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });

    document.body.classList.remove('flower-bg', 'music-bg', 'letter-bg');

    const target = document.getElementById(screenId);
    if (target) {
        // We use flex for everything to keep it centered
        target.style.display = 'flex'; 
        target.classList.add('active');

        if (screenId === 'flowers') document.body.classList.add('flower-bg');
        if (screenId === 'music') {
            document.body.classList.add('music-bg');
            // If the player isn't loaded yet, start it
            if (!player) initPlayer(playlist[currentVideoIndex].id);
        }
        if (screenId === 'letter') document.body.classList.add('letter-bg');
        
        if (screenId === 'photos' && typeof setupPuzzle === "function") setupPuzzle();
    }
}


// --- 2. NO BUTTON PRANK ---
function forceYes() {
    const title = document.getElementById('main-title');
    const text = document.getElementById('main-text');
    const gifContainer = document.getElementById('gif-container');
    if (title) title.innerText = "Wrong button! 😤";
    if (text) text.innerText = "Go back and say YES right now babyy!!!!";
    if (gifContainer) gifContainer.innerHTML = "<img src='angry.gif' width='150px'>";
}

// --- 3. PUZZLE ENGINE ---
function setupPuzzle() {
    const board = document.getElementById('puzzle-board');
    const img = "PUZZLE.jpeg"; 
    if (!board) return;
    board.innerHTML = ""; 
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.style.backgroundImage = `url(${img})`;
            piece.style.backgroundPosition = `-${c * 80}px -${r * 80}px`;
            const targetX = c * 80;
            const targetY = r * 80;
            piece.style.left = (Math.random() * 100 - 150) + "px"; 
            piece.style.top = (Math.random() * 400) + "px";
            piece.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
            addDragEvents(piece, targetX, targetY); 
            board.appendChild(piece);
        }
    }
} 

// --- 4. DRAG & SNAP LOGIC ---
function addDragEvents(el, correctX, correctY) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    el.onmousedown = function(e) {
        isDragging = true;
        el.style.zIndex = 1000;
        startX = e.clientX;
        startY = e.clientY;
        initialX = parseFloat(el.style.left) || 0;
        initialY = parseFloat(el.style.top) || 0;
        e.preventDefault();
    };
    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        el.style.left = (initialX + (e.clientX - startX)) + "px";
        el.style.top = (initialY + (e.clientY - startY)) + "px";
    });
    window.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        el.style.zIndex = 10;
        const curX = parseFloat(el.style.left);
        const curY = parseFloat(el.style.top);
        if (Math.abs(curX - correctX) < 40 && Math.abs(curY - correctY) < 40) {
            el.style.left = correctX + "px";
            el.style.top = correctY + "px";
            el.style.transform = "rotate(0deg)";
            el.classList.add("snapped");
            el.style.pointerEvents = "none"; 
        }
    });
}

// --- 5. PUZZLE SUCCESS LOGIC ---
function checkWin() {
    const snappedPieces = document.querySelectorAll('.puzzle-piece.snapped').length;
    if (snappedPieces >= 24) {
        const overlay = document.getElementById('success-overlay');
        if (overlay) { overlay.style.display = 'flex'; createSparkles(); }
    } else {
        alert("You still have " + (24 - snappedPieces) + " pieces to fit, baby! ❤️");
    }
}

function createSparkles() {
    const overlay = document.getElementById('success-overlay');
    document.querySelectorAll('.sparkle-star').forEach(s => s.remove());
    for (let i = 0; i < 20; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-star';
        sparkle.innerText = '✨';
        sparkle.style.left = Math.random() * 100 + "%";
        sparkle.style.top = Math.random() * 100 + "%";
        overlay.appendChild(sparkle);
    }
}

function closeSuccess() {
    const overlay = document.getElementById('success-overlay');
    if (overlay) overlay.style.display = 'none';
}

// --- 6. MUSIC PLAYER LOGIC ---
let player;
let currentVideoIndex = 0;
const playlist = [
    { id: 'HQitbbtPZz8', title: "Song Name 1" },
    { id: 'U4D7OquQrz4', title: "Song Name 2" },
    { id: 'fz78HOxOgEY', title: "Song Name 3" },
    { id: 'GJNdR_MKuDM', title: "Song Name 4" },
    { id: 'jA1hQi9nTdo', title: "Song Name 5" },
    { id: 'qVrpP4jZ3-Q', title: "Song Name 6" },
    { id: 'qVrpP4jZ3-Q', title: "Song Name 7" },
    { id: 'qklsqykuD_0', title: "Song Name 8" }
];

// This is the "Magic" function YouTube looks for
function onYouTubeIframeAPIReady() {
    initPlayer(playlist[currentVideoIndex].id);
}

function initPlayer(videoId) {
    if (player && player.destroy) player.destroy();
    player = new YT.Player('player', {
        height: '260', 
        width: '430', 
        videoId: videoId,
        playerVars: { 
            'autoplay': 1, 
            'controls': 1, 
            'origin': window.location.origin, // This is perfect now!
            'enablejsapi': 1 
        },
        events: {
            'onReady': (event) => {
                document.getElementById('song-title').innerText = playlist[currentVideoIndex].title;
                document.getElementById('play-btn-text').innerText = "PAUSE";
                event.target.playVideo(); // Force play on load
            }
        }
    });
}

function togglePlay() {
    if (!player || !player.getPlayerState) return;
    if (player.getPlayerState() === 1) {
        player.pauseVideo();
        document.getElementById('play-btn-text').innerText = "PLAY";
    } else {
        player.playVideo();
        document.getElementById('play-btn-text').innerText = "PAUSE";
    }
}

function nextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % playlist.length;
    initPlayer(playlist[currentVideoIndex].id);
}

function prevVideo() {
    currentVideoIndex = (currentVideoIndex - 1 + playlist.length) % playlist.length;
    initPlayer(playlist[currentVideoIndex].id);
}

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);