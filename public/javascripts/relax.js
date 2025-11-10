// Playlist inicial: troque ou adicione URLs se desejar
const initialTracks = [
    { title: 'Chuva Suave', artist: 'Relax', src: '/sounds/mixkit-light-rain-loop-2393.wav' },
    { title: 'Ondas do Mar', artist: 'Nature', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { title: 'Piano Calmo', artist: 'Instrumental', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'Rain loop', artist: 'Nature', src: '/sounds/mixkit-light-rain-loop-2393.wav' }
];

const playlistEl = document.getElementById('playlist');
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const currentTitle = document.getElementById('currentTitle');
const currentArtist = document.getElementById('currentArtist');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const progressBar = document.getElementById('progressBar');
const progressWrap = document.getElementById('progressWrap');
const volume = document.getElementById('volume');
const loopToggle = document.getElementById('loopToggle');
const shuffleToggle = document.getElementById('shuffleToggle');
const fileInput = document.getElementById('fileInput');

let tracks = [...initialTracks];
let currentIndex = 0;
let isPlaying = false;

function formatTime(seconds){
    if(!seconds || isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds/60).toString().padStart(2,'0');
    const s = Math.floor(seconds%60).toString().padStart(2,'0');
    return `${m}:${s}`;
}

function renderPlaylist(){
    playlistEl.innerHTML = '';
    tracks.forEach((t, i) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        if(i === currentIndex) li.classList.add('active');
        li.dataset.index = i;
        li.innerHTML = `<div>
                          <div class="track-title">${t.title}</div>
                          <div class="small-muted">${t.artist || '—'}</div>
                        </div>
                        <div class="small-muted">${t.uploaded ? 'Local' : 'Online'}</div>`;
        li.addEventListener('click', () => { playIndex(i); });
        playlistEl.appendChild(li);
    });
}

function playIndex(i){
    if(i < 0 || i >= tracks.length) return;
    currentIndex = i;
    const track = tracks[i];
    audio.src = track.src;
    audio.play().then(()=>{
        isPlaying = true; updatePlayBtn(); renderPlaylist();
    }).catch(err=>{
        console.warn('Erro ao tocar:', err);
    });
    currentTitle.textContent = track.title;
    currentArtist.textContent = track.artist || '';
}

function updatePlayBtn(){
    playBtn.textContent = isPlaying ? 'Pause' : 'Play';
}

playBtn.addEventListener('click', () => {
    if(!audio.src){ playIndex(currentIndex); return; }
    if(isPlaying) { audio.pause(); }
    else { audio.play(); }
});

prevBtn.addEventListener('click', () => {
    if(shuffleToggle.checked) { playIndex(Math.floor(Math.random()*tracks.length)); return; }
    const prev = (currentIndex - 1 + tracks.length) % tracks.length;
    playIndex(prev);
});

nextBtn.addEventListener('click', () => {
    if(shuffleToggle.checked) { playIndex(Math.floor(Math.random()*tracks.length)); return; }
    const next = (currentIndex + 1) % tracks.length;
    playIndex(next);
});

audio.addEventListener('play', () => { isPlaying = true; updatePlayBtn(); renderPlaylist(); });
audio.addEventListener('pause', () => { isPlaying = false; updatePlayBtn(); renderPlaylist(); });

audio.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
    const pct = (audio.currentTime / (audio.duration || 1)) * 100;
    progressBar.style.width = pct + '%';
});

audio.addEventListener('ended', () => {
    if(loopToggle.checked){ audio.currentTime = 0; audio.play(); return; }
    if(shuffleToggle.checked){ playIndex(Math.floor(Math.random()*tracks.length)); return; }
    const next = (currentIndex + 1);
    if(next < tracks.length) playIndex(next);
    else { audio.pause(); audio.currentTime = 0; }
});

// Seek on click
progressWrap.addEventListener('click', (e) => {
    const rect = progressWrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    if(audio.duration) audio.currentTime = pct * audio.duration;
});

// Volume
volume.addEventListener('input', () => { audio.volume = parseFloat(volume.value); });
audio.volume = parseFloat(volume.value);

// Add uploaded files
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(f => {
        const url = URL.createObjectURL(f);
        tracks.push({ title: f.name.replace(/\.[^/.]+$/, ''), artist: 'Arquivo local', src: url, uploaded: true });
    });
    renderPlaylist();
    // opcional: tocar o primeiro dos adicionados
    if(files.length) playIndex(tracks.length - files.length);
    // limpar input para permitir re-envio do mesmo arquivo no futuro
    fileInput.value = '';
});

// Render inicial
renderPlaylist();

// Tocar o primeiro por padrão (opcional)
// playIndex(0);

// Limpeza de objectURLs quando fechar a página (boas práticas)
window.addEventListener('beforeunload', () => {
    tracks.forEach(t => { if(t.uploaded && t.src.startsWith('blob:')) URL.revokeObjectURL(t.src); });
});
