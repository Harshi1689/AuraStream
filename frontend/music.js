/**
 * ==========================================================================
 * EMOTIONTUNE - MUSIC PLAYER CONTROLLER (Matching Image 1)
 * Features:
 *  - Mood Mixes: Happy Mix, Sad Mix, Neutral Mix
 *  - Dynamic Mood Colors & Emoji Art (Amber, Sapphire Blue, Lavender Violet)
 *  - Tracklist Table with Title, Artist & Time (#, TITLE, TIME)
 *  - Full Audio Playback Engine (Play/Pause, Prev, Next, Seek, Volume)
 *  - Syncs with Flask Backend: http://127.0.0.1:5000/music/<emotion>/<filename>
 *  - Embedded 3-Step Navigation Pill (1 · Home, 2 · Camera, 3 · Music)
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------------------------------------------------
    // 1. PLAYLIST & TRACK DATA DEFINITIONS (Matching Image 1 & local files)
    // ----------------------------------------------------------------------
    const playlistLibrary = {
        happy: {
            title: "Happy Mix",
            folder: "happy",
            emoji: "😊",
            theme: "happy",
            accentColor: "#f59e0b",
            gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.45) 0%, rgba(18, 14, 34, 0.98) 75%)",
            desc: "Music selected for your happy mood",
            tracks: [
                {
                    filename: "happy1.mp3",
                    title: "happy1.mp3",
                    artist: "EmotionTune · happy mix",
                    duration: "2:14",
                    durationSec: 134
                },
                {
                    filename: "happy2.mp3",
                    title: "happy2.mp3",
                    artist: "EmotionTune · happy mix",
                    duration: "2:15",
                    durationSec: 135
                }
            ]
        },
        sad: {
            title: "Sad Mix",
            folder: "sad",
            emoji: "😢",
            theme: "sad",
            accentColor: "#3b82f6",
            gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.45) 0%, rgba(18, 14, 34, 0.98) 75%)",
            desc: "Gentle acoustic melodies for quiet contemplation",
            tracks: [
                {
                    filename: "sad1.mp3",
                    title: "sad1.mp3",
                    artist: "EmotionTune · sad mix",
                    duration: "2:14",
                    durationSec: 134
                },
                {
                    filename: "sad2.mp3",
                    title: "sad2.mp3",
                    artist: "EmotionTune · sad mix",
                    duration: "2:15",
                    durationSec: 135
                }
            ]
        },
        neutral: {
            title: "Neutral Mix",
            folder: "neutral",
            emoji: "🍃",
            theme: "neutral",
            accentColor: "#8b5cf6",
            gradient: "linear-gradient(135deg, rgba(139, 92, 246, 0.45) 0%, rgba(18, 14, 34, 0.98) 75%)",
            desc: "Balanced rhythms and smooth lo-fi textures for focus",
            tracks: [
                {
                    filename: "neutral1.mp3",
                    title: "neutral1.mp3",
                    artist: "EmotionTune · neutral mix",
                    duration: "2:14",
                    durationSec: 134
                },
                {
                    filename: "neutral2.mp3",
                    title: "neutral2.mp3",
                    artist: "EmotionTune · neutral mix",
                    duration: "2:15",
                    durationSec: 135
                }
            ]
        }
    };

    // ----------------------------------------------------------------------
    // 2. DOM ELEMENTS
    // ----------------------------------------------------------------------
    const audioPlayer = document.getElementById("audioPlayer");

    // Banner Elements
    const playlistHero = document.getElementById("playlistHero");
    const playlistCoverArt = document.getElementById("playlistCoverArt");
    const heroCoverEmoji = document.getElementById("heroCoverEmoji");
    const playlistTitle = document.getElementById("playlistTitle");
    const playlistDesc = document.getElementById("playlistDesc");
    const heroPlayBtn = document.getElementById("heroPlayBtn");
    const heroPlayIcon = document.getElementById("heroPlayIcon");

    // Tracklist Table
    const tracklistTbody = document.getElementById("tracklistTbody");

    // Bottom Player Bar Elements
    const bottomCoverThumb = document.getElementById("bottomCoverThumb");
    const bottomThumbEmoji = document.getElementById("bottomThumbEmoji");
    const bottomTrackTitle = document.getElementById("bottomTrackTitle");
    const bottomTrackArtist = document.getElementById("bottomTrackArtist");

    // Playback Buttons
    const mainPlayPauseBtn = document.getElementById("mainPlayPauseBtn");
    const mainPlayIcon = document.getElementById("mainPlayIcon");
    const prevTrackBtn = document.getElementById("prevTrackBtn");
    const nextTrackBtn = document.getElementById("nextTrackBtn");

    // Scrubber Elements
    const currentTimeText = document.getElementById("currentTimeText");
    const totalDurationText = document.getElementById("totalDurationText");
    const progressBarSlider = document.getElementById("progressBarSlider");
    const progressFill = document.getElementById("progressFill");
    const progressThumb = document.getElementById("progressThumb");

    // Volume Elements
    const volumeBtn = document.getElementById("volumeBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const volumeFill = document.getElementById("volumeFill");
    const volumeThumb = document.getElementById("volumeThumb");
    const volumeIcon = document.getElementById("volumeIcon");

    // ----------------------------------------------------------------------
    // 3. INITIAL STATE
    // ----------------------------------------------------------------------
    const params = new URLSearchParams(window.location.search);
    let activeMoodKey = (params.get("emotion") || "happy").toLowerCase();
    if (!playlistLibrary[activeMoodKey]) {
        // Map alternative detected emotions to closest primary mixes
        if (activeMoodKey === "angry" || activeMoodKey === "surprise") activeMoodKey = "happy";
        else if (activeMoodKey === "fear" || activeMoodKey === "disgust") activeMoodKey = "sad";
        else activeMoodKey = "happy";
    }

    let activeTrackIndex = 0;
    let isPlaying = false;
    let currentVolume = 0.8;
    let isMuted = false;
    let isScrubbing = false;

    if (audioPlayer) {
        audioPlayer.volume = currentVolume;
    }

    // ----------------------------------------------------------------------
    // 4. MOOD SWITCHING & PLAYLIST RENDERING
    // ----------------------------------------------------------------------
    window.switchMood = function (moodKey, autoStart = false) {
        if (!playlistLibrary[moodKey]) return;
        activeMoodKey = moodKey;
        activeTrackIndex = 0;
        renderMoodView(moodKey, autoStart);
    };

    function renderMoodView(moodKey, autoStart) {
        const data = playlistLibrary[moodKey];

        // 1. Update Banner Appearance
        if (playlistHero) {
            playlistHero.style.background = data.gradient;
        }
        if (playlistCoverArt) {
            playlistCoverArt.className = `mood-artwork-square ${data.theme}`;
        }
        if (heroCoverEmoji) {
            heroCoverEmoji.innerText = data.emoji;
        }
        if (playlistTitle) {
            playlistTitle.innerText = data.title;
        }
        if (playlistDesc) {
            playlistDesc.innerText = data.desc;
        }

        // 2. Update Sidebar Active Mix Item
        const mixMap = {
            happy: document.getElementById("mixItemHappy"),
            sad: document.getElementById("mixItemSad"),
            neutral: document.getElementById("mixItemNeutral")
        };
        Object.keys(mixMap).forEach(key => {
            if (mixMap[key]) {
                mixMap[key].classList.toggle("active", key === moodKey);
            }
        });

        // 3. Update Quick Filter Pills
        const pillMap = {
            happy: document.getElementById("pillHappy"),
            sad: document.getElementById("pillSad"),
            neutral: document.getElementById("pillNeutral")
        };
        Object.keys(pillMap).forEach(key => {
            if (pillMap[key]) {
                pillMap[key].classList.toggle("active", key === moodKey);
            }
        });

        // 4. Render Tracklist Rows (Matching Image 1)
        renderTrackRows(data.tracks);

        // 5. Load Track 0
        loadTrack(0, autoStart);
    }

    function renderTrackRows(tracks) {
        if (!tracklistTbody) return;
        tracklistTbody.innerHTML = "";

        tracks.forEach((track, idx) => {
            const tr = document.createElement("tr");
            tr.className = `tracklist-row ${idx === activeTrackIndex ? 'playing-active' : ''}`;
            tr.setAttribute("data-index", idx);

            tr.innerHTML = `
                <td class="td-num">
                    <span class="track-index-num">${idx + 1}</span>
                    <button class="row-play-btn" title="Play">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                    </button>
                </td>
                <td class="td-title">
                    <div class="row-title-text">${track.title}</div>
                    <div class="row-artist-text">${track.artist}</div>
                </td>
                <td class="td-time">${track.duration}</td>
            `;

            tr.addEventListener("click", function () {
                activeTrackIndex = idx;
                loadTrack(idx, true);
            });

            tracklistTbody.appendChild(tr);
        });
    }

    // ----------------------------------------------------------------------
    // 5. AUDIO PLAYBACK ENGINE & LOCAL FALLBACK
    // ----------------------------------------------------------------------
    function loadTrack(index, shouldPlay) {
        const data = playlistLibrary[activeMoodKey];
        if (!data || !data.tracks[index]) return;

        const track = data.tracks[index];
        activeTrackIndex = index;

        // Update Bottom Bar info
        if (bottomTrackTitle) bottomTrackTitle.innerText = track.title;
        if (bottomTrackArtist) bottomTrackArtist.innerText = track.artist;
        if (bottomThumbEmoji) bottomThumbEmoji.innerText = data.emoji;
        if (bottomCoverThumb) bottomCoverThumb.className = `bottom-thumb-art ${data.theme}`;
        if (totalDurationText) totalDurationText.innerText = track.duration;

        // Highlight active row in table
        if (tracklistTbody) {
            const rows = tracklistTbody.querySelectorAll(".tracklist-row");
            rows.forEach((row, i) => {
                row.classList.toggle("playing-active", i === index);
            });
        }

        // Set audio source: points to Flask backend or relative path
        if (audioPlayer) {
            const backendUrl = `http://127.0.0.1:5000/music/${data.folder}/${track.filename}`;
            const localFallbackUrl = `../music/${data.folder}/${track.filename}`;

            // Try backend URL first
            audioPlayer.src = backendUrl;

            // If error, fall back to local relative path
            audioPlayer.onerror = function () {
                console.warn("Backend stream offline, switching to relative music path:", localFallbackUrl);
                audioPlayer.src = localFallbackUrl;
                if (shouldPlay) {
                    audioPlayer.play().catch(e => console.log("Auto-play prevented:", e));
                }
            };

            if (shouldPlay) {
                audioPlayer.play().then(() => {
                    setPlayingState(true);
                }).catch(err => {
                    console.log("Playback error or user gesture required:", err);
                    setPlayingState(false);
                });
            } else {
                setPlayingState(false);
            }
        }
    }

    function togglePlay() {
        if (!audioPlayer) return;
        if (isPlaying) {
            audioPlayer.pause();
            setPlayingState(false);
        } else {
            audioPlayer.play().then(() => {
                setPlayingState(true);
            }).catch(e => console.log("Play failed:", e));
        }
    }

    function setPlayingState(playing) {
        isPlaying = playing;
        const playIconSvg = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
        `;
        const pauseIconSvg = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
        `;

        if (heroPlayIcon) heroPlayIcon.parentElement.innerHTML = playing ? pauseIconSvg : playIconSvg;
        if (mainPlayIcon) mainPlayIcon.parentElement.innerHTML = playing ? pauseIconSvg : playIconSvg;
    }

    function prevTrack() {
        const data = playlistLibrary[activeMoodKey];
        if (!data) return;
        let newIdx = activeTrackIndex - 1;
        if (newIdx < 0) newIdx = data.tracks.length - 1;
        loadTrack(newIdx, true);
    }

    function nextTrack() {
        const data = playlistLibrary[activeMoodKey];
        if (!data) return;
        let newIdx = activeTrackIndex + 1;
        if (newIdx >= data.tracks.length) newIdx = 0;
        loadTrack(newIdx, true);
    }

    // ----------------------------------------------------------------------
    // 6. SCRUBBER TIMELINE & TIME UPDATES
    // ----------------------------------------------------------------------
    if (audioPlayer) {
        audioPlayer.addEventListener("timeupdate", function () {
            if (isScrubbing) return;
            const current = audioPlayer.currentTime || 0;
            const duration = audioPlayer.duration || playlistLibrary[activeMoodKey].tracks[activeTrackIndex].durationSec;

            if (currentTimeText) currentTimeText.innerText = formatTime(current);

            const pct = duration > 0 ? (current / duration) * 100 : 0;
            if (progressFill) progressFill.style.width = `${pct}%`;
            if (progressThumb) progressThumb.style.left = `${pct}%`;
        });

        audioPlayer.addEventListener("ended", function () {
            nextTrack();
        });
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Click to seek on progress bar
    if (progressBarSlider && audioPlayer) {
        progressBarSlider.addEventListener("click", function (e) {
            const rect = progressBarSlider.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, clickX / rect.width));
            const duration = audioPlayer.duration || playlistLibrary[activeMoodKey].tracks[activeTrackIndex].durationSec;

            audioPlayer.currentTime = pct * duration;
            if (progressFill) progressFill.style.width = `${pct * 100}%`;
            if (progressThumb) progressThumb.style.left = `${pct * 100}%`;
        });
    }

    // ----------------------------------------------------------------------
    // 7. VOLUME CONTROL
    // ----------------------------------------------------------------------
    if (volumeSlider && audioPlayer) {
        volumeSlider.addEventListener("click", function (e) {
            const rect = volumeSlider.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, clickX / rect.width));
            currentVolume = pct;
            audioPlayer.volume = currentVolume;
            if (volumeFill) volumeFill.style.width = `${pct * 100}%`;
            if (volumeThumb) volumeThumb.style.left = `${pct * 100}%`;
            isMuted = currentVolume === 0;
            updateVolumeIcon();
        });
    }

    if (volumeBtn && audioPlayer) {
        volumeBtn.addEventListener("click", function () {
            isMuted = !isMuted;
            audioPlayer.muted = isMuted;
            updateVolumeIcon();
        });
    }

    function updateVolumeIcon() {
        if (!volumeIcon) return;
        if (isMuted || audioPlayer.volume === 0) {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
            `;
        } else {
            volumeIcon.innerHTML = `
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            `;
        }
    }

    // ----------------------------------------------------------------------
    // 8. EVENT LISTENERS ATTACHMENT
    // ----------------------------------------------------------------------
    if (heroPlayBtn) heroPlayBtn.addEventListener("click", togglePlay);
    if (mainPlayPauseBtn) mainPlayPauseBtn.addEventListener("click", togglePlay);
    if (prevTrackBtn) prevTrackBtn.addEventListener("click", prevTrack);
    if (nextTrackBtn) nextTrackBtn.addEventListener("click", nextTrack);

    // Initial render
    renderMoodView(activeMoodKey, false);

});