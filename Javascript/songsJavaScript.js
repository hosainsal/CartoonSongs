// Default visuals
const defaultImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD__zJ1SxcNRKyBBAm868XaFs5dXvBDzDIV0CCWXyh924dvOrMdBaWey9dhnEIAt2pUlAQmhV10o3QkGruMbhTAOrH7eyDG5YE0jG3CDYzDuTG0zUyoIEqwKeITI7ijtdpIAaR2EJB_Xq9eMPS1h7sQdJJ3jJQYJa11Zn6m4c_AlYy6LIpr63V7iL9ZPRHgoQzH-ywSIkc6GY-_Jh4Qq_sExYOE2X6DhrzNx4W9D6I-FUPPbcfJ6VZiZYTpHORB0BvRE_A76cLoU0o",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBTPiUbGMyBIuE_huTwV9Zwj5yvP0Fw7YIFr0Kg-f_x79gWBNbO7YMO1Big0ezD6gEnLIrPVSga3s1X2JXPxrh1-Vu8hVI2xI1MPbYg9eOkNgA6Uzu-6aZ6FuHJP3MnXnFxlIBYk3TmpjatyiSjEkgcQWvBWyiylLoll19zZ7hDpZ2GRcFpIJboKzRcKeDBKNNXHcThj4apRGo0MWxNjrLTtqFFzLvqfi1EkHQQ-BfncOaCclic-6YbEcpAvi3JWIf1luiRJ0yUWUk",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBgVzOZXvMF2vO_nmjW3FaVpYZXGjOsgzFnTr9yS_OEG89Wj51VWFqE8EEJ1SCPrzxCTsufLsu2LblGQOVmjoQnbgCqTHw6taGn2HDz4rd-LDz_rqm88NDoU6OuPp97rz47Y5UCGuMA-PFuUiQx332rKTUQaNAC6KpWLPmlC_TOVqd0MLISjayJlpYCOmxPtUDLuerj6KLAbJnforys9UmQN_bZZ16j0Q6R0u6RIYOLzViosLrAaHHzsbPh8KJKl4baZ_0GxL1pTqI",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCFeFAXUKXM4GFAA1aHxJ7BAznw9RFkIteYWnO5uVDWgfA6Bb3voyOJAegcAoq2vE5kn7awO8H7tiH9pxM-XqESLp_Vb8gJFsgpk6NSVcE7IHarU1HLYA0waVk1uYAdOU-Eltfn3c9-c9G5-wtyEQNJwt36QLBHwZAY8A3Q0zMxq5TlJEJeFhpYgntidqKFwSMqmGLfar2x3-cNgHFKffdOO4GLpgRJhw8rX7oTNEl4CtsE7erYjkEi5BEB7ctLX1CITarCNZOKoQs",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBs962u1jaS5edMZbbmD4TFg_obRegV87zEQexVYl9pjfIciiq23ZUCZlq3h3ZAubtRWJkTK2ZuszEejFPsyKQEcVUAI5KrOWJCyCz64DQH1qIDw_PJrH7s5NbKZ_FZBBkrkuXq7yQ9FXiPlo_BXqEfftRejbMZ0q0WkWprmGcPAzoeb9i_e46eyz2uXKAaToRyeCDboXlwJphuW0akUc0jgVsBLDFGwde2_7BFRTTao8_StwjaTF6eqnqwt2Nqfilgkq3xgLVpZsU"
];
const defaultColors = ["#7058d0", "#01658c", "#965c59", "#573eb6", "#d0588c"];

// Format data for the app
const songsData = rawSongsData.map((song, index) => ({
    id: "song-" + song.id,
    title: song.title,
    audioUrl: song.audioUrl,
    lyrics: song.lyrics.split('\n').filter(line => line.trim() !== ''),
    // Uses JSON imageUrl if valid, otherwise falls back to defaults
    img: (song.imageUrl && !song.imageUrl.includes("via.placeholder.com")) ? song.imageUrl : defaultImages[index % defaultImages.length],
    color: defaultColors[index % defaultColors.length]
}));

// Wake Lock API
let wakeLock = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');
        }
    } catch (err) {
        console.warn(`${err.name}, ${err.message}`);
    }
}
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => {
            wakeLock = null;
            console.log('Wake Lock released');
        });
    }
}

// Render Library
const gridContainer = document.getElementById('songs-grid');
function renderLibrary() {
    gridContainer.innerHTML = '';
    songsData.forEach(song => {
        const card = document.createElement('div');
        card.className = "glass-card rounded-[32px] p-sm flex flex-col items-center transition-all duration-300 hover:scale-[1.02] active:scale-95 group cursor-pointer";
        card.onclick = () => openSong(song.id);
        card.innerHTML = `
                    <div class="relative w-full aspect-square rounded-[24px] overflow-hidden mb-sm shadow-sm">
                        <img src="${song.img}" alt="${song.title}" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <h3 class="font-headline-md text-[18px] text-primary-container text-center mb-xs truncate w-full" dir="rtl">${song.title}</h3>
                `;
        gridContainer.appendChild(card);
    });
}

// Audio Player Logic
let currentSongObj = null;
const audioPlayer = new Audio();
let isPlaying = false;

const btnPlay = document.getElementById('btn-play');
const iconPlay = document.getElementById('icon-play');
const progressBar = document.getElementById('progress-bar');
const progressHead = document.getElementById('progress-head');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const playerGlow = document.getElementById('player-glow');

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

audioPlayer.addEventListener('timeupdate', () => {
    if (!audioPlayer.duration) return;
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${percent}%`;
    progressHead.style.right = `calc(${100 - percent}% - 10px)`;
    timeCurrent.innerText = formatTime(audioPlayer.currentTime);
});

audioPlayer.addEventListener('loadedmetadata', () => {
    timeTotal.innerText = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('ended', () => {
    stopPlayer();
});

function togglePlay() {
    if (!currentSongObj || !currentSongObj.audioUrl) return;

    if (audioPlayer.paused) {
        audioPlayer.play().then(() => {
            isPlaying = true;
            iconPlay.innerText = 'pause';
            playerGlow.classList.add('playing-glow'); // Start glow animation
        }).catch(e => console.error("Error playing audio:", e));
    } else {
        audioPlayer.pause();
        isPlaying = false;
        iconPlay.innerText = 'play_arrow';
        playerGlow.classList.remove('playing-glow'); // Stop glow animation
    }
}

function stopPlayer() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false;
    iconPlay.innerText = 'play_arrow';
    progressBar.style.width = '0%';
    progressHead.style.right = 'calc(100% - 10px)';
    timeCurrent.innerText = "00:00";
    playerGlow.classList.remove('playing-glow');
}

function skip(amount) {
    if (!audioPlayer.duration) return;
    audioPlayer.currentTime = Math.min(Math.max(audioPlayer.currentTime + amount, 0), audioPlayer.duration);
}

function seek(e) {
    if (!audioPlayer.duration) return;
    const rect = document.getElementById('progress-container').getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = 1 - (clickX / rect.width); // Inverse for RTL
    audioPlayer.currentTime = audioPlayer.duration * percent;
}

// Navigation & State Management
function openSong(songId) {
    const song = songsData.find(s => s.id === songId);
    if (!song) return;

    currentSongObj = song;
    stopPlayer();

    const controlsContainer = document.getElementById('audio-controls-container');
    const noAudioMessage = document.getElementById('no-audio-message');

    if (song.audioUrl) {
        audioPlayer.src = song.audioUrl;
        audioPlayer.load();

        // Show player, hide message
        controlsContainer.classList.remove('hidden');
        controlsContainer.classList.add('flex');
        noAudioMessage.classList.add('hidden');
        noAudioMessage.classList.remove('flex');
    } else {
        audioPlayer.removeAttribute('src');
        timeTotal.innerText = "00:00";

        // Hide player, show message
        controlsContainer.classList.add('hidden');
        controlsContainer.classList.remove('flex');
        noAudioMessage.classList.remove('hidden');
        noAudioMessage.classList.add('flex');
    }

    // Populate Screen
    document.getElementById('player-title').innerText = song.title;
    document.getElementById('player-img').src = song.img;
    playerGlow.style.backgroundColor = song.color;
    timeTotal.innerText = "00:00";

    const lyricsHtml = song.lyrics.map((line, index) =>
        `<p class="font-body-lg ${index === 0 ? 'font-bold text-primary-container' : ''}">${line}</p>`
    ).join('');
    document.getElementById('player-lyrics').innerHTML = lyricsHtml;

    // Transition
    document.getElementById('library-view').classList.remove('active');
    document.getElementById('song-view').classList.add('active');
    window.scrollTo(0, 0);

    try { window.location.hash = songId; } catch (e) { }
    requestWakeLock();
}

function navigateHome() {
    stopPlayer();

    document.getElementById('song-view').classList.remove('active');
    document.getElementById('library-view').classList.add('active');

    try { window.location.hash = ''; } catch (e) { }
    releaseWakeLock();
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    renderLibrary();
    const hash = window.location.hash.substring(1);
    if (hash && songsData.find(s => s.id === hash)) {
        openSong(hash);
    } else {
        navigateHome();
    }
});

window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    if (!hash) navigateHome();
});