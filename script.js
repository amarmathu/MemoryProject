// Retrieve Audio Player DOM elements
const audio = document.getElementById("voicePlayer");
const play = document.getElementById("playButton");
const progress = document.getElementById("progress");
const current = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const fullDuration = document.getElementById("fullDuration");

// Retrieve Dynamic Content DOM elements
const photo = document.getElementById("photo");
const title = document.getElementById("title");
const message = document.getElementById("message");

// Card Container DOM elements
const memoryCard = document.getElementById("memoryCard");
const errorCard = document.getElementById("errorCard");

// Read URL parameters
const params = new URLSearchParams(window.location.search);
const id = params.get("id") || "001";

// Application Configuration
const APP_MODE = "production"; // Set to "development" to enable local storage testing

// Retrieve custom customers stored in localStorage (Development Only)
let localCustomers = {};
if (APP_MODE !== "production") {
    try {
        const stored = localStorage.getItem("memory_gift_customers");
        if (stored) {
            localCustomers = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Failed to parse custom customers database:", e);
    }
}

// Merge static customers database with local customers database
const allCustomers = { ...customers, ...localCustomers };
const customer = allCustomers[id];

if (!customer) {
    // 1. Error Handling: Display clean "Memory Not Found" page
    if (memoryCard) memoryCard.style.display = "none";
    if (errorCard) errorCard.style.display = "block";
    
    // Fallback blurred background
    document.body.style.backgroundImage = "linear-gradient(rgba(255, 255, 255, 0.20), rgba(255, 255, 255, 0.20)), url('images/photo.jpeg')";
} else {
    // 2. Load Customer Details
    if (memoryCard) memoryCard.style.display = "block";
    if (errorCard) errorCard.style.display = "none";

    // Set page title for personalization and SEO
    document.title = `${customer.title} - Memory Gift`;

    // Resolve URLs using StorageManager
    const resolvedPhotoUrl = StorageManager.resolvePhoto(customer.photo);
    const resolvedVoiceUrl = StorageManager.resolveVoice(customer.voice);

    console.log("Resolved Photo URL:", resolvedPhotoUrl);
    console.log("Resolved Voice URL:", resolvedVoiceUrl);

    if (title) title.innerText = customer.title;
    if (message) message.innerText = customer.message;

    // Set Dynamic Background based on resolved photo URL
    document.body.style.backgroundImage = `linear-gradient(rgba(255, 255, 255, 0.20), rgba(255, 255, 255, 0.20)), url("${resolvedPhotoUrl}")`;

// 3. Image Load Lifecycle with skeleton loading & fade-in transition
if (photo) {
    const photoWrapper = photo.parentElement;
    if (photoWrapper) {
        photoWrapper.classList.add("skeleton");
    }
    photo.style.opacity = "0";

    photo.onload = () => {
        if (photoWrapper) photoWrapper.classList.remove("skeleton");
        photo.style.opacity = "1";
    };

    photo.onerror = function(e) {
        console.log("Photo failed:", photo.src);
        console.log(e);

        if (!photo.dataset.fallbackTriggered) {
            photo.dataset.fallbackTriggered = "true";
            photo.src = "images/photo.jpeg";
        }
    };

    // IMPORTANT: Load the image AFTER all handlers are attached
    photo.src = resolvedPhotoUrl;
}

    // 4. Audio Load Lifecycle with spinner & error handling
    if (audio) {
        // Show loading spinner on play button immediately when audio source starts loading
        if (play) {
            play.classList.add("loading");
        }

        // Configure audio events
        audio.onloadedmetadata = () => {
            if (play) play.classList.remove("loading");
            if (!isNaN(audio.duration) && isFinite(audio.duration)) {
                const formattedTime = format(audio.duration);
                if (duration) duration.innerHTML = formattedTime;
                if (fullDuration) fullDuration.innerHTML = formattedTime;
            }
        };

        audio.oncanplay = () => {
            if (play) play.classList.remove("loading");
        };

       audio.onerror = function () {

    console.error("Audio failed to load");
    console.error("Requested URL:", audio.src);
    console.error(audio.error);

    if (play) {
        play.classList.remove("loading");
        play.disabled = true;
        play.innerHTML = "✕";
        play.style.opacity = "0.5";
        play.style.cursor = "not-allowed";
    }

    if (fullDuration) {
        fullDuration.innerHTML =
            "<span class='audio-error-text'>Voice message unavailable</span>";
    }

    if (duration) {
        duration.innerHTML = "--:--";
    }
};
            console.warn("Audio file failed to load. Playback disabled.");
        };

        // Assign source after defining events to prevent race conditions with cache
        audio.src = resolvedVoiceUrl;
    }
}

// 5. Audio Control Events
if (play && audio) {
    play.onclick = () => {
        // Double check audio is not in error state
        if (audio.error) return;

        if (audio.paused) {
            audio.play().catch(err => {
                console.error("Playback failed:", err);
            });
            play.innerHTML = "❚❚";
        } else {
            audio.pause();
            play.innerHTML = "▶";
        }
    };
}

if (audio) {
    audio.ontimeupdate = () => {
        if (current) current.innerHTML = format(audio.currentTime);
        if (progress && audio.duration) {
            progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
        }
    };

    audio.onended = () => {
        if (play) play.innerHTML = "▶";
    };
}

// Helper: Format seconds into MM:SS format
function format(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
