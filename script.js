document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const splashScreen = document.getElementById('splash-screen');
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const loginBtn = document.getElementById('loginBtn');
    const fullNameInput = document.getElementById('fullName');
    const regNumberInput = document.getElementById('regNumber');

    const progressBar = document.getElementById('progressBar');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    const questionnaireForm = document.getElementById('questionnaire-form');
    const ticketSection = document.getElementById('ticket-section');
    const ticketPreview = document.getElementById('ticket-preview');
    const mapSection = document.getElementById('map-section');

    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');

    // --- State Variables ---
    let userFullName = '';
    let userRegNumber = '';
    let countdownInterval;

    // --- Splash Screen Logic ---
    // Hide the splash screen after a few seconds to reveal the login page.
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.opacity = '0';
            // After the fade-out transition, hide it completely so it doesn't block interaction.
            splashScreen.addEventListener('transitionend', () => {
                splashScreen.style.display = 'none';
            }, { once: true });
        }
    }, 3000); // Splash screen is visible for 3 seconds.

    // --- Configuration ---
    // IMPORTANT: Make sure this date is in the future for the countdown to work.
    const eventStartDate = new Date('2026-04-28T20:00:00');
    
    /**
     * Handles the login process, saves user data, and reveals the main dashboard.
     */
    function handleLogin() {
        userFullName = fullNameInput.value.trim();
        userRegNumber = regNumberInput.value.trim();

        if (!userFullName || !userRegNumber) {
            alert('Please fill in both your Full Name and Registration Number.');
            return;
        }

        // --- MODIFIED FOR FADE ANIMATION ---
        // 1. Start fading out the login section by setting its opacity to 0.
        loginSection.style.opacity = '0';

        // 2. After the fade-out transition ends, set its display to 'none'.
        loginSection.addEventListener('transitionend', () => {
            loginSection.style.display = 'none';
        }, { once: true });

        // 3. Prepare main content to be shown. Start it transparent and remove the 'hidden' class.
        mainContent.style.opacity = '0';
        mainContent.classList.remove('hidden');

        // 4. Use a small timeout. This allows the browser to apply 'display: block' from the CSS
        // *before* the opacity is changed, which is necessary for the fade-in transition to work.
        setTimeout(() => {
            mainContent.style.opacity = '1';
        }, 50);

        // Initial call to update dashboard visuals
        updateCountdown();
        // Update countdown every second
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    /**
     * Calculates and updates the event countdown and visual progress bar.
     */
    function updateCountdown() {
        const now = new Date();
        const timeDiff = eventStartDate.getTime() - now.getTime();

        if (timeDiff <= 0) {
            // Event has started or is over
            daysEl.textContent = '0';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            clearInterval(countdownInterval);
        } else {
            // Calculate days, hours, minutes, seconds
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            // Update the DOM
            daysEl.textContent = days;
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        // --- REVISED PROGRESS BAR LOGIC ---
        // The progress bar will now start filling up during a defined window (e.g., the last 30 days).
        const countdownWindowDays = 30; // You can change this value
        const totalWindowTime = 1000 * 60 * 60 * 24 * countdownWindowDays; // Window in milliseconds

        let progressPercentage = 0;

        if (timeDiff <= 0) {
            // If the event has started or is over, the bar is full.
            progressPercentage = 100;
        } else if (timeDiff < totalWindowTime) {
            // If we are within the countdown window, calculate progress.
            // Progress is the percentage of the window that has passed.
            const timeElapsedInWindow = totalWindowTime - timeDiff;
            progressPercentage = (timeElapsedInWindow / totalWindowTime) * 100;
        }
        // If timeDiff > totalWindowTime (more than 30 days left), progress remains 0.

        // Ensure the percentage is between 0 and 100
        progressPercentage = Math.max(0, Math.min(100, progressPercentage));
        progressBar.style.width = `${progressPercentage}%`;
    }

    /**
     * Determines ticket category based on questionnaire answers and generates the ticket.
     * @param {Event} e - The form submission event.
     */
    function handleQuestionnaireSubmit(e) {
        e.preventDefault(); // Prevent page reload on form submission

        const formData = new FormData(questionnaireForm);
        const q1 = formData.get('q1');
        const q2 = formData.get('q2');
        const q3 = formData.get('q3');

        // Basic validation
        if (!q1 || !q2 || !q3) {
            alert('You must answer all questions to determine your fate.');
            return;
        }

        // Scoring logic
        const scoreMap = { 'a': 1, 'b': 2, 'c': 3 };
        const totalScore = scoreMap[q1] + scoreMap[q2] + scoreMap[q3];

        let passName;
        if (totalScore >= 3 && totalScore <= 5) {
            passName = 'DANDU MONARA PASS';
        } else if (totalScore >= 6 && totalScore <= 7) {
            passName = 'RAKSHASA PASS';
        } else { // Score 8-9
            passName = 'YAKSHA ADHIPATHI PASS';
        }

        // Pass the determined name to the ticket generator
        generateTicket(passName);
    }

    /**
     * Generates and displays the personalized ticket in the preview container.
     * @param {string} passName - The name of the pass determined by the questionnaire score.
     */
    function generateTicket(passName) {
        // Get the new display elements inside the overlay
        const displayName = document.getElementById('display-name');
        const displayReg = document.getElementById('display-reg');
        const displayTokenId = document.getElementById('display-token-id');
        const displayPassType = document.getElementById('display-pass-type'); // New element

        // Populate ticket with user and dynamic data
        displayPassType.textContent = passName; // Set the pass name
        displayName.textContent = userFullName;
        displayReg.textContent = `Reg: ${userRegNumber}`;
        // Generate a unique token ID as requested
        const tokenId = 'RVN-' + Math.floor(1000 + Math.random() * 9000);
        displayTokenId.textContent = `Token: ${tokenId}`;

        // --- MODIFIED FOR FADE ANIMATION ---
        // 1. Prepare the ticket section to be shown. Start it transparent and remove the 'hidden' class.
        ticketSection.style.opacity = '0';
        ticketSection.classList.remove('hidden');

        // 2. Use a timeout to trigger the fade-in and then scroll into view.
        setTimeout(() => {
            ticketSection.style.opacity = '1';
            ticketSection.scrollIntoView({ behavior: 'smooth', block: 'end' });

            // After ticket is shown, reveal the map.
            revealMap();
        }, 50);
    }

    /**
     * Reveals the map section and loads the Google Maps script.
     */
    function revealMap() {
        mapSection.style.opacity = '0';
        mapSection.classList.remove('hidden');
        
        setTimeout(() => {
            mapSection.style.opacity = '1';
            mapSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
            initMap();
        }, 200); // A small delay after the ticket appears
    }

    /**
     * Converts the ticket preview div to a PNG image and initiates a download.
     */
    function downloadTicket() {
        console.log('Download button clicked. Attempting to generate token image...');
        const captureArea = document.getElementById('ticket-capture-area');

        if (!captureArea) {
            console.error('Error: Ticket capture area not found.');
            alert('Sorry, an error occurred. Please try again.');
            return;
        }

        if (typeof html2canvas === 'undefined') {
            console.error('Error: html2canvas library is not loaded. Cannot download token.');
            alert('Sorry, there was an error preparing the download. Please try again.');
            return;
        }

        // Use html2canvas to capture the div
        html2canvas(captureArea, {
            scale: 3, // Use a higher scale for better image resolution, as requested
            backgroundColor: null,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            // Create a temporary link to trigger the download
            const link = document.createElement('a');
            link.download = `AuraFest-Token-${userRegNumber}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            console.log('Token download initiated successfully.');
        }).catch(error => {
            console.error('html2canvas failed:', error);
            alert('An error occurred while generating the token image. Please check the console for details.');
        });
    }

    /**
     * Converts the ticket to an image and shares it using the Web Share API.
     * Falls back to downloading if sharing is not supported.
     */
    async function handleShareTicket() {
        console.log('Share button clicked. Attempting to generate and share token image...');
        const captureArea = document.getElementById('ticket-capture-area');

        if (!captureArea) {
            console.error('Error: Ticket capture area not found.');
            alert('Sorry, an error occurred. Please try again.');
            return;
        }

        if (typeof html2canvas === 'undefined') {
            console.error('Error: html2canvas library is not loaded. Cannot share token.');
            alert('Sorry, there was an error preparing the share. Please try again.');
            return;
        }

        try {
            const canvas = await html2canvas(captureArea, {
                scale: 3, // High resolution for sharing
                backgroundColor: null,
                useCORS: true,
                allowTaint: true
            });

            // Convert canvas to a blob, which is required for the Web Share API
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            const file = new File([blob], `AuraFest-Token-${userRegNumber}.png`, { type: 'image/png' });

            const shareData = {
                files: [file],
                title: 'My AuraFest Entry Token',
                text: 'My saga begins! I just got my exclusive entry token for AuraFest - The Return of Ravana. Witness the legend at: https://rudra2-uok.netlify.app/'
            };

            // Check if the browser supports sharing this data
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                console.log('Token shared successfully.');
            } else {
                // Fallback for browsers that don't support sharing files
                console.log('Web Share API not supported or cannot share this file, falling back to download.');
                alert('Native sharing not supported. Your token has been downloaded; please share it manually.');
                downloadTicket(); // Trigger download as a fallback
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing token:', error);
                alert('An error occurred while trying to share the token. Please check the console for details.');
            } else {
                console.log('Share action was cancelled by the user.');
            }
        }
    }

    // --- Event Listeners ---
    loginBtn.addEventListener('click', handleLogin);
    questionnaireForm.addEventListener('submit', handleQuestionnaireSubmit);
    downloadBtn.addEventListener('click', downloadTicket);
    shareBtn.addEventListener('click', handleShareTicket);
});

/**
 * Initializes the Leaflet map.
 */
function initMap() {
    const mapCanvas = document.getElementById('map-canvas');
    // Prevent re-initialization if map is already there
    if (!mapCanvas || mapCanvas.classList.contains('leaflet-container')) {
        return;
    }

    const universityCenter = [6.9740, 79.9161]; // Leaflet uses [lat, lng] array

    // Clue locations with riddles
    const clueLocations = [
        { pos: [6.9731, 79.9158], riddle: "Where countless scrolls of wisdom sleep, a secret the silent guardians keep." },
        { pos: [6.9758, 79.9150], riddle: "The crucible of elements, where future's laws are bent. Find the sign near the northern wall." },
        { pos: [6.9745, 79.9145], riddle: "By the sacred tree and house of peace, your next step finds release." },
        { pos: [6.9720, 79.9165], riddle: "Upon the stage beneath the sky, where echoes of ancient dramas lie." },
        { pos: [6.9728, 79.9153], riddle: "At the heart of student life, where paths cross and stories are rife." },
    ];

    // Initialize the map
    const map = L.map(mapCanvas, {
        center: universityCenter,
        zoom: 17,
        minZoom: 16,
        maxZoom: 18,
    });

    // Add the dark tile layer from CartoDB (DarkMatter). This does not require an API key.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
    }).addTo(map);

    // Create a custom icon class for the blinking marker
    const blinkingIcon = L.divIcon({
        className: 'blinking-marker',
        iconSize: [22, 22] // Match the updated CSS size
    });

    // Add markers for each clue
    clueLocations.forEach(clue => {
        const marker = L.marker(clue.pos, { icon: blinkingIcon }).addTo(map);

        const popupContent = `
            <div class="map-infowindow-content">
                <h4>A Secret Found</h4>
                <p>${clue.riddle}</p>
            </div>
        `;

        marker.bindPopup(popupContent);
    });
}
