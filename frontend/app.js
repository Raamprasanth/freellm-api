/* ==========================================================================
   IPL Cricket Auction Game - Core Logic (app.js)
   ========================================================================== */

// --- PLAYER DATABASE (40 Top Stars with stats and base prices in Lakhs) ---
// Base prices: 200L = 2 Crore, 150L = 1.5 Crore, 100L = 1 Crore, 50L = 50 Lakhs
const PLAYER_POOL = [
  { id: 1, name: "Virat Kohli", role: "BAT", rating: 98, nationality: "Indian", basePrice: 200, stats: { match: 252, runs: 8004, avg: "38.7", sr: "131.9" }, desc: "Master Chaser & IPL's All-time Leading Run Scorer" },
  { id: 2, name: "Jasprit Bumrah", role: "BOWL", rating: 98, nationality: "Indian", basePrice: 200, stats: { match: 133, wkts: 165, econ: "7.30", avg: "22.5" }, desc: "The World's Most Lethal Death-Over Bowler" },
  { id: 3, name: "MS Dhoni", role: "WK", rating: 97, nationality: "Indian", basePrice: 200, stats: { match: 264, runs: 5243, avg: "39.1", sr: "137.5" }, desc: "Legendary Captain Cool, Finisher & Gloveman" },
  { id: 4, name: "Rohit Sharma", role: "BAT", rating: 96, nationality: "Indian", basePrice: 200, stats: { match: 257, runs: 6628, avg: "29.7", sr: "131.2" }, desc: "The Hitman - 5-time IPL Winning Captain" },
  { id: 5, name: "Heinrich Klaasen", role: "WK", rating: 96, nationality: "Overseas", basePrice: 200, stats: { match: 35, runs: 998, avg: "43.4", sr: "168.3" }, desc: "Most Destructive Spin Basher in World Cricket" },
  { id: 6, name: "Pat Cummins", role: "AR", rating: 96, nationality: "Overseas", basePrice: 200, stats: { match: 58, wkts: 63, runs: 512, econ: "8.45" }, desc: "World Cup Winning Skipper & Clutch All-rounder" },
  { id: 7, name: "Rashid Khan", role: "BOWL", rating: 97, nationality: "Overseas", basePrice: 200, stats: { match: 121, wkts: 149, econ: "6.73", avg: "20.8" }, desc: "Afour-over bank of spin wizardry & handy hitter" },
  { id: 8, name: "Suryakumar Yadav", role: "BAT", rating: 97, nationality: "Indian", basePrice: 200, stats: { match: 150, runs: 3594, avg: "32.1", sr: "145.3" }, desc: "Mr. 360 - The Ultimate T20 Batter" },
  { id: 9, name: "Mitchell Starc", role: "BOWL", rating: 95, nationality: "Overseas", basePrice: 200, stats: { match: 43, wkts: 51, econ: "8.21", avg: "25.3" }, desc: "Fierce Left-arm Express Pacer with Lethal Yorkers" },
  { id: 10, name: "Andre Russell", role: "AR", rating: 96, nationality: "Overseas", basePrice: 200, stats: { match: 127, runs: 2484, wkts: 115, sr: "174.0" }, desc: "Dre Russ - Raw Muscle Power & Death Bowling Option" },
  { id: 11, name: "Rishabh Pant", role: "WK", rating: 95, nationality: "Indian", basePrice: 200, stats: { match: 111, runs: 3284, avg: "35.3", sr: "148.9" }, desc: "Dynamic Left-hand Keeper-Batter & Match Winner" },
  { id: 12, name: "Sunil Narine", role: "AR", rating: 96, nationality: "Overseas", basePrice: 200, stats: { match: 176, wkts: 180, runs: 1542, econ: "6.63" }, desc: "Mystery Spinner & Explosive Opening Batsman" },
  { id: 13, name: "Hardik Pandya", role: "AR", rating: 95, nationality: "Indian", basePrice: 200, stats: { match: 137, runs: 2525, wkts: 64, sr: "146.2" }, desc: "Premier Indian Fast-Bowling All-Rounder & Leader" },
  { id: 14, name: "Travis Head", role: "BAT", rating: 95, nationality: "Overseas", basePrice: 200, stats: { match: 25, runs: 772, avg: "33.6", sr: "172.5" }, desc: "Ultra-Aggressive Opener who dominates Powerplays" },
  { id: 15, name: "Shubman Gill", role: "BAT", rating: 94, nationality: "Indian", basePrice: 200, stats: { match: 103, runs: 3216, avg: "37.8", sr: "135.2" }, desc: "Elegant Young Prince of Indian Cricket" },
  { id: 16, name: "Yashasvi Jaiswal", role: "BAT", rating: 94, nationality: "Indian", basePrice: 150, stats: { match: 52, runs: 1608, avg: "32.2", sr: "150.7" }, desc: "Fearless Young Left-Handed Opening Sensation" },
  { id: 17, name: "Ravindra Jadeja", role: "AR", rating: 95, nationality: "Indian", basePrice: 200, stats: { match: 240, runs: 2958, wkts: 160, econ: "7.59" }, desc: "Elite Gun Fielder, Accurate Spinner & Hitter" },
  { id: 18, name: "Nicholas Pooran", role: "WK", rating: 95, nationality: "Overseas", basePrice: 200, stats: { match: 76, runs: 1768, avg: "30.5", sr: "156.4" }, desc: "Caribbean Dynamic Left-Hand Middle Order Assassin" },
  { id: 19, name: "Glenn Maxwell", role: "AR", rating: 93, nationality: "Overseas", basePrice: 200, stats: { match: 134, runs: 2771, wkts: 37, sr: "156.8" }, desc: "The Big Show - Innovator of Unorthodox Shots" },
  { id: 20, name: "Mohammed Shami", role: "BOWL", rating: 94, nationality: "Indian", basePrice: 200, stats: { match: 110, wkts: 127, econ: "8.44", avg: "26.7" }, desc: "Unmatched Upright Seam Position & Powerplay Wickets" },
  { id: 21, name: "Jos Buttler", role: "WK", rating: 96, nationality: "Overseas", basePrice: 200, stats: { match: 107, runs: 3582, avg: "38.1", sr: "147.5" }, desc: "Elite T20 Opener with Multiple IPL Centuries" },
  { id: 22, name: "Kuldeep Yadav", role: "BOWL", rating: 93, nationality: "Indian", basePrice: 150, stats: { match: 84, wkts: 87, econ: "8.12", avg: "25.8" }, desc: "Tricky Left-Arm Wrist Spinner in Red-hot Form" },
  { id: 23, name: "Axar Patel", role: "AR", rating: 94, nationality: "Indian", basePrice: 150, stats: { match: 150, runs: 1653, wkts: 123, econ: "7.24" }, desc: "Highly Consistent Bowling All-Rounder & Finisher" },
  { id: 24, name: "Trent Boult", role: "BOWL", rating: 93, nationality: "Overseas", basePrice: 150, stats: { match: 96, wkts: 121, econ: "8.29", avg: "24.6" }, desc: "King of First-Over Wickets with In-swinging Deliveries" },
  { id: 25, name: "Yuzvendra Chahal", role: "BOWL", rating: 93, nationality: "Indian", basePrice: 150, stats: { match: 160, wkts: 205, econ: "7.84", avg: "22.4" }, desc: "All-time Highest Wicket-Taker in IPL History" },
  { id: 26, name: "Rinku Singh", role: "BAT", rating: 92, nationality: "Indian", basePrice: 100, stats: { match: 46, runs: 893, avg: "31.9", sr: "148.8" }, desc: "Incredible Finisher Famously Known for 5 Sixes in an Over" },
  { id: 27, name: "KL Rahul", role: "WK", rating: 93, nationality: "Indian", basePrice: 200, stats: { match: 132, runs: 4683, avg: "45.5", sr: "134.6" }, desc: "Consistently High Run Getter & Anchor Batsman" },
  { id: 28, name: "Kagiso Rabada", role: "BOWL", rating: 93, nationality: "Overseas", basePrice: 200, stats: { match: 80, wkts: 117, econ: "8.42", avg: "21.6" }, desc: "South African Speedster with Lethal Yorkers" },
  { id: 29, name: "Matheesha Pathirana", role: "BOWL", rating: 92, nationality: "Overseas", basePrice: 100, stats: { match: 20, wkts: 34, econ: "7.88", avg: "18.3" }, desc: "Baby Malinga - Slingy Action & Untouchable Slower Balls" },
  { id: 30, name: "Shivam Dube", role: "AR", rating: 91, nationality: "Indian", basePrice: 100, stats: { match: 65, runs: 1395, avg: "28.5", sr: "143.2" }, desc: "Tall Power-Hitter who absolutely decimates Spinners" },
  { id: 31, name: "Abhishek Sharma", role: "BAT", rating: 91, nationality: "Indian", basePrice: 75, stats: { match: 63, runs: 1377, avg: "25.5", sr: "150.2" }, desc: "Explosive Left-hand Opener with a Sky-high Strike Rate" },
  { id: 32, name: "Quinton de Kock", role: "WK", rating: 91, nationality: "Overseas", basePrice: 150, stats: { match: 107, runs: 3156, avg: "31.2", sr: "134.2" }, desc: "Experienced South African Opener-Keeper" },
  { id: 33, name: "Riyan Parag", role: "BAT", rating: 90, nationality: "Indian", basePrice: 50, stats: { match: 70, runs: 1173, avg: "24.5", sr: "138.8" }, desc: "Aggressive Middle-Order Hitter & Leg-spin Option" },
  { id: 34, name: "Harshit Rana", role: "BOWL", rating: 89, nationality: "Indian", basePrice: 50, stats: { match: 21, wkts: 25, econ: "8.90", avg: "23.4" }, desc: "Rising Young Pacer with excellent variations & attitude" },
  { id: 35, name: "Mayank Yadav", role: "BOWL", rating: 88, nationality: "Indian", basePrice: 50, stats: { match: 4, wkts: 7, econ: "6.98", avg: "12.1" }, desc: "Raw Indian Speed Merchant regularly clocking 155+ KPH" },
  { id: 36, name: "Jake Fraser-McGurk", role: "BAT", rating: 90, nationality: "Overseas", basePrice: 75, stats: { match: 9, runs: 330, avg: "36.7", sr: "234.0" }, desc: "Fearless Aussie Youngster playing at a surreal strike rate" },
  { id: 37, name: "Shreyas Iyer", role: "BAT", rating: 92, nationality: "Indian", basePrice: 200, stats: { match: 116, runs: 3127, avg: "31.6", sr: "126.8" }, desc: "Solid Middle-Order Captain & Excellent Spin Player" },
  { id: 38, name: "Arshdeep Singh", role: "BOWL", rating: 92, nationality: "Indian", basePrice: 150, stats: { match: 65, wkts: 76, econ: "8.76", avg: "27.1" }, desc: "India's premier Left-arm T20 Specialist & Death Bowler" },
  { id: 39, name: "Sam Curran", role: "AR", rating: 91, nationality: "Overseas", basePrice: 200, stats: { match: 59, runs: 883, wkts: 58, sr: "136.2" }, desc: "Versatile English Swing Bowler & Handy Lower-Order Hitter" },
  { id: 40, name: "Liam Livingstone", role: "AR", rating: 90, nationality: "Overseas", basePrice: 100, stats: { match: 39, runs: 939, wkts: 11, sr: "162.5" }, desc: "Mammoth Six Hitter & Useful Mixed Spin Bowler" }
];

// --- FRANCHISES DEFINITIONS ---
const FRANCHISES = [
  { shortName: "CSK", name: "Chennai Super Kings", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "csk-badge", themeClass: "theme-csk", aiProfile: { multiplier: 1.05, roles: { BAT: 1.1, BOWL: 0.9, AR: 1.2, WK: 1.0 }, overseasLimit: 8 } },
  { shortName: "MI", name: "Mumbai Indians", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "mi-badge", themeClass: "theme-mi", aiProfile: { multiplier: 1.12, roles: { BAT: 0.9, BOWL: 1.2, AR: 1.1, WK: 0.9 }, overseasLimit: 8 } },
  { shortName: "RCB", name: "Royal Challengers Bangalore", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "rcb-badge", themeClass: "theme-rcb", aiProfile: { multiplier: 1.15, roles: { BAT: 1.3, BOWL: 0.8, AR: 0.9, WK: 1.1 }, overseasLimit: 8 } },
  { shortName: "KKR", name: "Kolkata Knight Riders", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "kkr-badge", themeClass: "theme-kkr", aiProfile: { multiplier: 1.10, roles: { BAT: 0.9, BOWL: 1.0, AR: 1.4, WK: 0.9 }, overseasLimit: 8 } },
  { shortName: "DC", name: "Delhi Capitals", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "dc-badge", themeClass: "theme-dc", aiProfile: { multiplier: 0.98, roles: { BAT: 1.1, BOWL: 1.1, AR: 0.9, WK: 1.0 }, overseasLimit: 8 } },
  { shortName: "RR", name: "Rajasthan Royals", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "rr-badge", themeClass: "theme-rr", aiProfile: { multiplier: 1.02, roles: { BAT: 1.0, BOWL: 1.1, AR: 0.9, WK: 1.1 }, overseasLimit: 8 } },
  { shortName: "PBKS", name: "Punjab Kings", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "pbks-badge", themeClass: "theme-pbks", aiProfile: { multiplier: 1.18, roles: { BAT: 1.0, BOWL: 1.0, AR: 1.1, WK: 1.0 }, overseasLimit: 8 } }, // Tends to overspend
  { shortName: "SRH", name: "Sunrisers Hyderabad", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "srh-badge", themeClass: "theme-srh", aiProfile: { multiplier: 1.08, roles: { BAT: 1.1, BOWL: 1.1, AR: 1.1, WK: 0.9 }, overseasLimit: 8 } },
  { shortName: "LSG", name: "Lucknow Super Giants", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "lsg-badge", themeClass: "theme-lsg", aiProfile: { multiplier: 0.95, roles: { BAT: 1.0, BOWL: 1.0, AR: 1.2, WK: 1.0 }, overseasLimit: 8 } },
  { shortName: "GT", name: "Gujarat Titans", purse: 10000, squad: [], RTM: 1, isAI: true, badgeClass: "gt-badge", themeClass: "theme-gt", aiProfile: { multiplier: 1.00, roles: { BAT: 0.9, BOWL: 1.2, AR: 1.1, WK: 0.8 }, overseasLimit: 8 } }
];

// --- GAME STATE ---
let activeFranchises = JSON.parse(JSON.stringify(FRANCHISES)); // Deep copy
let activePlayers = [];
let userTeam = null;
let currentIndex = 0;
let currentBid = 0; // in Lakhs
let currentBidder = null;
let bidTimer = 10;
let timerInterval = null;
let isAutoRunning = false;
let autoBidTimeout = null;
let userPassed = false;
let soundMuted = false;

// Audio Context for native synthesizer
let audioCtx = null;

// Confetti System variables
let confettiCanvas = null;
let confettiCtx = null;
let confettiParticles = [];
let isConfettiActive = false;

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initUI();
  initConfetti();
  initSoundToggle();
});

// Render startup list of teams
function initUI() {
  const teamGrid = document.getElementById("team-select-grid");
  teamGrid.innerHTML = "";
  
  activeFranchises.forEach(franchise => {
    const card = document.createElement("div");
    card.className = "team-select-card";
    card.dataset.team = franchise.shortName;
    card.innerHTML = `
      <div class="team-badge ${franchise.badgeClass}">${franchise.shortName}</div>
      <div class="team-select-name">${franchise.name}</div>
    `;
    card.addEventListener("click", () => {
      document.querySelectorAll(".team-select-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      document.getElementById("start-auction-btn").disabled = false;
    });
    teamGrid.appendChild(card);
  });
  
  // Disable start button until a team is chosen
  document.getElementById("start-auction-btn").disabled = true;
  document.getElementById("start-auction-btn").addEventListener("click", startAuction);
}

// Sound toggle controls
function initSoundToggle() {
  const soundBtn = document.getElementById("sound-toggle-btn");
  soundBtn.addEventListener("click", () => {
    soundMuted = !soundMuted;
    if (soundMuted) {
      soundBtn.classList.add("muted");
      soundBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z"></path></svg>
        Muted
      `;
    } else {
      soundBtn.classList.remove("muted");
      soundBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        Sound On
      `;
      // Trigger user gesture for AudioContext initialization
      initAudio();
    }
  });
}

// Start Game and transition screens
function startAuction() {
  initAudio();
  
  const selectedSelectedCard = document.querySelector(".team-select-card.selected");
  if (!selectedSelectedCard) return;
  
  const chosenTeamCode = selectedSelectedCard.dataset.team;
  
  // Set user franchise
  activeFranchises.forEach(f => {
    if (f.shortName === chosenTeamCode) {
      f.isAI = false;
      userTeam = f;
    }
  });
  
  // Configure game options
  const poolSize = parseInt(document.getElementById("auction-size-select").value);
  const shuffled = [...PLAYER_POOL].sort(() => 0.5 - Math.random());
  activePlayers = shuffled.slice(0, poolSize);
  
  // Apply theme styling to root body based on chosen user franchise
  document.body.className = `theme-${chosenTeamCode.toLowerCase()}`;
  
  // Hide startup overlay
  document.getElementById("startup-modal-overlay").classList.add("hidden");
  
  // Initialize panels
  updateLeaderboard();
  renderUpcomingQueue();
  addLog("system", `IPL Mega Auction commenced! <strong>${userTeam.name}</strong> managed by User.`);
  
  // Start first player
  loadPlayer(0);
}

// --- AUDIO SYNTHESIZER (Native Web Audio API) ---
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playSound(type) {
  if (soundMuted || !audioCtx) return;
  
  // Make sure context is running
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  
  try {
    const now = audioCtx.currentTime;
    
    if (type === "bid") {
      // Digital beep synth
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.13);
    } 
    else if (type === "hammer") {
      // Wooden block knock synth
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      
      osc.start(now);
      osc.stop(now + 0.21);
      
      // Add a slight double-strike knock for realism after 0.08s
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(160, now + 0.07);
      osc2.frequency.exponentialRampToValueAtTime(70, now + 0.22);
      
      gain2.gain.setValueAtTime(0.4, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      osc2.start(now + 0.07);
      osc2.stop(now + 0.23);
    } 
    else if (type === "tick") {
      // Soft mechanical wood tick
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(1600, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      
      osc.start(now);
      osc.stop(now + 0.04);
    }
    else if (type === "cheer") {
      // Synthesized crowd roar using filtered noise
      const bufferSize = audioCtx.sampleRate * 1.5; // 1.5 seconds
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Fill buffer with white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = buffer;
      
      // Filter to simulate cheering frequency band
      const filter = audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(800, now + 0.4);
      filter.frequency.exponentialRampToValueAtTime(350, now + 1.5);
      filter.Q.setValueAtTime(1.5, now);
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.3); // Rise
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Decay
      
      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      noiseNode.start(now);
      noiseNode.stop(now + 1.5);
    }
  } catch (e) {
    console.warn("Audio Context error:", e);
  }
}

// --- PLAYER LOADING & CARD RENDERING ---
function loadPlayer(index) {
  if (index >= activePlayers.length) {
    endAuctionGame();
    return;
  }
  
  currentIndex = index;
  const player = activePlayers[currentIndex];
  currentBid = 0;
  currentBidder = null;
  userPassed = false;
  
  // Clear any existing timer
  clearInterval(timerInterval);
  clearTimeout(autoBidTimeout);
  
  // Update state text
  document.getElementById("auction-status-badge").innerText = `Player ${currentIndex + 1} of ${activePlayers.length}`;
  
  // Render Player Card
  const card = document.getElementById("active-player-card");
  card.className = `player-card role-${player.role.toLowerCase()}`;
  
  card.innerHTML = `
    <div class="card-top">
      <span class="player-role-badge">${player.role}</span>
      <span class="player-rating">${player.rating} RTG</span>
    </div>
    <div class="player-avatar-container">
      <div class="player-silhouette">
        <svg class="player-avatar-svg" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </div>
      <div class="player-country-flag">${player.nationality}</div>
    </div>
    <div class="player-details">
      <h3 class="player-name">${player.name}</h3>
      <p class="player-desc">${player.desc}</p>
    </div>
    <div class="player-stats-grid">
      ${getStatsHTML(player)}
    </div>
  `;
  
  // Reset Bidding Ring
  updateBidDisplay();
  
  // Setup timer countdown visual
  resetTimer();
  
  // Update queue highlight
  renderUpcomingQueue();
  
  // Trigger intro log
  addLog("system", `Under the hammer: <strong>${player.name}</strong> (${player.role}, ${player.nationality}). Base Price: <strong>${formatMoney(player.basePrice)}</strong>`);
  
  // Enable buttons
  enableBiddingButtons();
  
  // Kick off AI bidding loop
  scheduleAIBid();
}

function getStatsHTML(player) {
  if (player.role === "BAT" || player.role === "WK") {
    return `
      <div class="stat-item"><span class="stat-val">${player.stats.match}</span><span class="stat-lbl">Matches</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.runs}</span><span class="stat-lbl">Runs</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.avg}</span><span class="stat-lbl">Average</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.sr}</span><span class="stat-lbl">Str. Rate</span></div>
    `;
  } else if (player.role === "BOWL") {
    return `
      <div class="stat-item"><span class="stat-val">${player.stats.match}</span><span class="stat-lbl">Matches</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.wkts}</span><span class="stat-lbl">Wickets</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.econ}</span><span class="stat-lbl">Econ Rate</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.avg}</span><span class="stat-lbl">Average</span></div>
    `;
  } else { // AR (All Rounder)
    return `
      <div class="stat-item"><span class="stat-val">${player.stats.match}</span><span class="stat-lbl">Matches</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.runs || "—"}</span><span class="stat-lbl">Runs</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.wkts || "—"}</span><span class="stat-lbl">Wickets</span></div>
      <div class="stat-item"><span class="stat-val">${player.stats.econ || player.stats.sr || "—"}</span><span class="stat-lbl">Econ/SR</span></div>
    `;
  }
}

// --- TIMER MANAGMENT ---
function resetTimer() {
  clearInterval(timerInterval);
  bidTimer = 10;
  drawTimerCircle();
  
  timerInterval = setInterval(() => {
    bidTimer--;
    
    if (bidTimer <= 3 && bidTimer > 0) {
      playSound("tick");
    }
    
    drawTimerCircle();
    
    if (bidTimer <= 0) {
      clearInterval(timerInterval);
      resolveActivePlayer();
    }
  }, 1000);
}

function drawTimerCircle() {
  const circle = document.getElementById("timer-progress-bar");
  const secondsEl = document.getElementById("timer-sec-count");
  const timerCircle = document.querySelector(".timer-circle");
  
  secondsEl.innerText = bidTimer;
  
  // Circumference of radius 75 circle is 2 * PI * 75 = ~471
  const r = 75;
  const circumference = 2 * Math.PI * r;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  
  const offset = circumference - (bidTimer / 10) * circumference;
  circle.style.strokeDashoffset = offset;
  
  if (bidTimer <= 3) {
    timerCircle.classList.add("warning");
  } else {
    timerCircle.classList.remove("warning");
  }
}

// --- MONEY AND BID INCREMENT UTILS ---
function formatMoney(lakhs) {
  if (lakhs >= 100) {
    const crores = (lakhs / 100).toFixed(2);
    // Trim trailing zeros from decimals
    return `₹${parseFloat(crores)} Crore`;
  }
  return `₹${lakhs} Lakhs`;
}

function getNextIncrement(currentValue) {
  // IPL bid rules:
  // Under 2 Crore (200L): Increment by 20L
  // 2 - 5 Crore (200L - 500L): Increment by 50L
  // Above 5 Crore (500L): Increment by 100L
  if (currentValue < 200) {
    return 20;
  } else if (currentValue < 500) {
    return 50;
  } else {
    return 100;
  }
}

// Update primary center displays
function updateBidDisplay() {
  const currentBidEl = document.getElementById("display-current-bid");
  const currentBidderEl = document.getElementById("display-current-bidder");
  const baseTag = document.getElementById("display-base-price");
  
  const player = activePlayers[currentIndex];
  
  if (currentBid === 0) {
    currentBidEl.innerText = "No Bids";
    currentBidderEl.innerText = "Waiting for opening bid...";
    currentBidderEl.style.backgroundColor = "transparent";
    currentBidderEl.style.borderColor = "transparent";
  } else {
    currentBidEl.innerText = formatMoney(currentBid);
    currentBidderEl.innerText = currentBidder.name;
    currentBidderEl.style.backgroundColor = `var(--${currentBidder.shortName.toLowerCase()}-primary)`;
    currentBidderEl.style.color = (currentBidder.shortName === 'CSK' || currentBidder.shortName === 'SRH') ? '#000' : '#fff';
    currentBidderEl.style.borderColor = `var(--${currentBidder.shortName.toLowerCase()}-secondary)`;
  }
  
  baseTag.innerHTML = `Base Price: <strong>${formatMoney(player.basePrice)}</strong>`;
  
  // Set incremental values on bid buttons
  const nextInc = getNextIncrement(currentBid === 0 ? player.basePrice - 20 : currentBid);
  const btnVal1 = (currentBid === 0 ? player.basePrice : currentBid + nextInc);
  const btnVal2 = btnVal1 + getNextIncrement(btnVal1);
  const btnVal3 = btnVal2 + getNextIncrement(btnVal2);
  
  setupBidButton(1, btnVal1);
  setupBidButton(2, btnVal2);
  setupBidButton(3, btnVal3);
}

function setupBidButton(num, val) {
  const btn = document.getElementById(`bid-btn-${num}`);
  btn.dataset.value = val;
  btn.querySelector(".bid-btn-value").innerText = formatMoney(val);
  
  // Check if User can afford this bid
  const excessPurse = userTeam.purse < val;
  const squadFull = userTeam.squad.length >= 25;
  const isOverseas = activePlayers[currentIndex].nationality === "Overseas";
  const overseasFull = isOverseas && userTeam.squad.filter(p => p.nationality === "Overseas").length >= 8;
  
  if (excessPurse || squadFull || overseasFull || userPassed || activePlayers[currentIndex].sold) {
    btn.disabled = true;
    if (squadFull) btn.querySelector(".bid-btn-label").innerText = "Squad Full";
    else if (overseasFull) btn.querySelector(".bid-btn-label").innerText = "OS Full";
    else if (excessPurse) btn.querySelector(".bid-btn-label").innerText = "No Budget";
    else btn.querySelector(".bid-btn-label").innerText = "Locked";
  } else {
    btn.disabled = false;
    btn.querySelector(".bid-btn-label").innerText = `Place Bid`;
  }
}

function enableBiddingButtons() {
  document.getElementById("pass-btn").disabled = false;
}

function disableBiddingButtons() {
  document.querySelectorAll(".bid-btn").forEach(b => b.disabled = true);
  document.getElementById("pass-btn").disabled = true;
}

// --- USER ACTION HANDLERS ---
// Triggered when clicking a bid button
function placeUserBid(event) {
  initAudio();
  const bidAmount = parseInt(event.currentTarget.dataset.value);
  executeBid(userTeam, bidAmount);
}

// Pass button drops user out
function userPass() {
  initAudio();
  userPassed = true;
  addLog("user", `User passed on <strong>${activePlayers[currentIndex].name}</strong>. AI will complete bidding.`);
  disableBiddingButtons();
  
  // Immediately resume AI loop to decide remainder
  if (timerInterval) resetTimer();
  scheduleAIBid();
}

// --- AI BIDDING SIMULATOR ---
function scheduleAIBid() {
  clearTimeout(autoBidTimeout);
  if (activePlayers[currentIndex].sold) return;
  
  // Random delay between 1.2s to 2.2s for bids
  const delay = 1200 + Math.random() * 1000;
  
  autoBidTimeout = setTimeout(() => {
    runAIBidDecision();
  }, delay);
}

function runAIBidDecision() {
  if (activePlayers[currentIndex].sold || bidTimer <= 0) return;
  
  const player = activePlayers[currentIndex];
  const isOverseas = player.nationality === "Overseas";
  
  // Determine next bid amount
  let nextBidAmount = 0;
  if (currentBid === 0) {
    nextBidAmount = player.basePrice;
  } else {
    nextBidAmount = currentBid + getNextIncrement(currentBid);
  }
  
  // Gather list of interested AI franchises
  let biddingFranchises = [];
  
  activeFranchises.forEach(franchise => {
    // Skip if it's the user's team or the current highest bidder
    if (!franchise.isAI || (currentBidder && currentBidder.shortName === franchise.shortName)) return;
    
    // Check purse constraints
    if (franchise.purse < nextBidAmount) return;
    
    // Check squad slot constraints
    if (franchise.squad.length >= 25) return;
    
    // Check overseas limits
    if (isOverseas) {
      const osCount = franchise.squad.filter(p => p.nationality === "Overseas").length;
      if (osCount >= franchise.aiProfile.overseasLimit) return;
    }
    
    // Evaluate valuation threshold
    // Valuation based on Base Price, Rating, and AI Profile multipliers
    let valuation = player.basePrice * (player.rating / 82);
    
    // Apply team-specific profile logic
    const rolePref = franchise.aiProfile.roles[player.role] || 1.0;
    valuation *= rolePref;
    
    // Team multiplier (aggressiveness)
    valuation *= franchise.aiProfile.multiplier;
    
    // If they have lots of money left, increase bidding threshold
    if (franchise.purse > 6000) {
      valuation *= 1.15;
    }
    // If running low on money, dial it back
    if (franchise.purse < 3000) {
      valuation *= 0.8;
    }
    
    // If next bid fits within valuation, team is interested
    if (nextBidAmount <= valuation) {
      // Calculate a dynamic bid probability (higher interest -> higher chance)
      let probability = 0.35;
      if (nextBidAmount < valuation * 0.7) probability = 0.65; // Highly likely to bid
      
      if (Math.random() < probability) {
        biddingFranchises.push({ franchise, score: valuation - nextBidAmount });
      }
    }
  });
  
  if (biddingFranchises.length > 0) {
    // Pick the franchise with the highest score/interest
    biddingFranchises.sort((a, b) => b.score - a.score);
    const chosenBidder = biddingFranchises[0].franchise;
    
    executeBid(chosenBidder, nextBidAmount);
  } else {
    // No AI bids at the moment. Let the clock tick down.
    // If user has already passed, we might resolve earlier or let it tick down
    if (userPassed && currentBidder) {
      // If user passed and an AI team holds the bid, speed up the countdown
      if (bidTimer > 3) {
        bidTimer = 3;
      }
    }
  }
  
  // Re-schedule next AI bid evaluation if not sold
  if (!activePlayers[currentIndex].sold) {
    scheduleAIBid();
  }
}

// Execute a bid transaction
function executeBid(bidder, amount) {
  // Edge check: bidder must have purse
  if (bidder.purse < amount) return;
  
  // Set state
  previousBidder = currentBidder;
  currentBidder = bidder;
  currentBid = amount;
  
  playSound("bid");
  updateBidDisplay();
  resetTimer();
  
  addLog("bid", `<strong>${bidder.shortName}</strong> bid <strong>${formatMoney(amount)}</strong>`);
  
  // Highlight the bidding team on the left dashboard temporarily
  flashTeamCard(bidder.shortName);
}

function flashTeamCard(teamCode) {
  const card = document.querySelector(`.team-card[data-team="${teamCode}"]`);
  if (!card) return;
  
  card.style.borderColor = `var(--${teamCode.toLowerCase()}-primary)`;
  card.style.boxShadow = `var(--${teamCode.toLowerCase()}-glow)`;
  
  setTimeout(() => {
    card.style.borderColor = "";
    card.style.boxShadow = "";
  }, 800);
}

// --- AUCTION RESOLUTION (SOLD / UNSOLD) ---
function resolveActivePlayer() {
  clearTimeout(autoBidTimeout);
  
  const player = activePlayers[currentIndex];
  player.sold = true;
  
  if (currentBidder) {
    // Player is SOLD!
    const winner = activeFranchises.find(f => f.shortName === currentBidder.shortName);
    
    winner.purse -= currentBid;
    player.finalPrice = currentBid;
    player.boughtBy = winner.shortName;
    winner.squad.push(player);
    
    playSound("hammer");
    
    addLog("sold", `🔨 <strong>SOLD!</strong> <strong>${player.name}</strong> goes to <strong>${winner.name}</strong> for <strong>${formatMoney(currentBid)}</strong>!`);
    
    // Celebrate if user won! Or if it is a record buy (> ₹12 Crore / 1200L)
    if (!winner.isAI) {
      celebrateWinner();
      addLog("system", `🎉 Congratulations! You secured ${player.name} for your squad.`);
    } else if (currentBid >= 1200) {
      playSound("cheer");
      triggerConfetti(100);
      addLog("system", `🔥 Record Alert! ${winner.shortName} makes a massive buy.`);
    }
  } else {
    // Player went UNSOLD
    player.finalPrice = 0;
    player.boughtBy = null;
    
    playSound("hammer");
    addLog("unsold", `❌ <strong>UNSOLD!</strong> <strong>${player.name}</strong> passes with no bids.`);
  }
  
  // Disable buttons during transition
  disableBiddingButtons();
  
  // Update left leaderboard totals
  updateLeaderboard();
  
  // Transition to next player after short delay
  setTimeout(() => {
    loadPlayer(currentIndex + 1);
  }, 3200);
}

// --- UPCOMING QUEUE WRITER ---
function renderUpcomingQueue() {
  const qList = document.getElementById("upcoming-queue-list");
  qList.innerHTML = "";
  
  for (let i = currentIndex + 1; i < activePlayers.length; i++) {
    const p = activePlayers[i];
    const item = document.createElement("div");
    item.className = "queue-card";
    item.innerHTML = `
      <div class="queue-player-info">
        <span class="queue-player-name">${p.name}</span>
        <span class="queue-player-role">${p.role} &bull; ${p.nationality}</span>
      </div>
      <div class="queue-player-base">${formatMoney(p.basePrice)}</div>
    `;
    qList.appendChild(item);
  }
  
  if (qList.children.length === 0) {
    qList.innerHTML = `<div class="base-price-tag" style="border:none;">No players left in the queue</div>`;
  }
}

// --- LEADERBOARD & MODALS ---
function updateLeaderboard() {
  const teamListEl = document.getElementById("leaderboard-team-list");
  teamListEl.innerHTML = "";
  
  // Sort teams by remaining budget (highest first)
  const sortedTeams = [...activeFranchises].sort((a, b) => b.purse - a.purse);
  
  sortedTeams.forEach(team => {
    const card = document.createElement("div");
    card.className = `team-card ${team.shortName === userTeam?.shortName ? 'user-team' : ''}`;
    card.dataset.team = team.shortName;
    
    const osCount = team.squad.filter(p => p.nationality === "Overseas").length;
    
    card.innerHTML = `
      <div class="team-badge ${team.badgeClass}">${team.shortName}</div>
      <div class="team-info">
        <span class="team-name">${team.name.split(' ').slice(-1)[0]}</span>
        <span class="team-squad-count">Squad: ${team.squad.length}/25 (OS: ${osCount}/8)</span>
      </div>
      <div class="team-purse">${(team.purse / 100).toFixed(2)} Cr</div>
    `;
    
    // Clicking on leaderboard card opens squad viewer
    card.addEventListener("click", () => openSquadModal(team.shortName));
    
    teamListEl.appendChild(card);
  });
}

function openSquadModal(teamCode) {
  const team = activeFranchises.find(f => f.shortName === teamCode);
  if (!team) return;
  
  const modal = document.getElementById("squad-modal-overlay");
  const title = document.getElementById("squad-modal-team-title");
  const statsBox = document.getElementById("squad-modal-stats");
  const tableBody = document.getElementById("squad-players-table-body");
  
  title.innerText = `${team.name} - Squad Roster`;
  
  // Calculations
  const osCount = team.squad.filter(p => p.nationality === "Overseas").length;
  const spentLakhs = 10000 - team.purse;
  const avgRating = team.squad.length > 0 
    ? (team.squad.reduce((sum, p) => sum + p.rating, 0) / team.squad.length).toFixed(1)
    : 0;
    
  statsBox.innerHTML = `
    <div class="squad-summary-box">
      <span class="squad-summary-value">${team.squad.length}/25</span>
      <span class="squad-summary-label">Total Players</span>
    </div>
    <div class="squad-summary-box">
      <span class="squad-summary-value">${osCount}/8</span>
      <span class="squad-summary-label">Overseas Limit</span>
    </div>
    <div class="squad-summary-box">
      <span class="squad-summary-value gold">${(team.purse / 100).toFixed(2)} Cr</span>
      <span class="squad-summary-label">Purse Left</span>
    </div>
    <div class="squad-summary-box">
      <span class="squad-summary-value">${avgRating}</span>
      <span class="squad-summary-label">Squad Rating</span>
    </div>
  `;
  
  // Render roster rows
  tableBody.innerHTML = "";
  if (team.squad.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No players purchased yet</td></tr>`;
  } else {
    team.squad.forEach((p, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td style="font-weight:600;">${idx + 1}</td>
        <td style="font-weight:700;color:var(--accent-cyan);">${p.name}</td>
        <td><span class="tag-role ${p.role}">${p.role}</span></td>
        <td>${p.nationality}</td>
        <td style="font-weight:700;color:var(--accent-gold);text-align:right;">${formatMoney(p.finalPrice)}</td>
      `;
      tableBody.appendChild(row);
    });
  }
  
  modal.classList.remove("hidden");
}

function closeSquadModal() {
  document.getElementById("squad-modal-overlay").classList.add("hidden");
}

// --- LOGGING ---
function addLog(type, html) {
  const container = document.getElementById("log-timeline-container");
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-text">${html}</span>
  `;
  
  container.prepend(entry); // Prepend so latest is always on top
  
  // Limit to 50 logs for performance
  if (container.children.length > 50) {
    container.removeChild(container.lastChild);
  }
}

// --- CONFETTI PARTICLE SYSTEM ---
function initConfetti() {
  confettiCanvas = document.getElementById("confetti-canvas");
  confettiCtx = confettiCanvas.getContext("2d");
  
  resizeConfettiCanvas();
  window.addEventListener("resize", resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
}

function triggerConfetti(count = 80) {
  initConfetti(); // Ensure sizing is correct
  
  const colors = ["#ffd700", "#00f0ff", "#ff007f", "#39ff14", "#ffffff", "#ff8c00"];
  
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 50,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 6,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: -4 + Math.random() * 8
    });
  }
  
  if (!isConfettiActive) {
    isConfettiActive = true;
    requestAnimationFrame(updateConfetti);
  }
}

// Animation loop
function updateConfetti() {
  if (confettiParticles.length === 0) {
    isConfettiActive = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    return;
  }
  
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  
  confettiParticles.forEach((p, idx) => {
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotationSpeed;
    
    // Draw rotated rectangle
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
    confettiCtx.restore();
    
    // Remove if off-screen
    if (p.y > confettiCanvas.height) {
      confettiParticles.splice(idx, 1);
    }
  });
  
  requestAnimationFrame(updateConfetti);
}

function celebrateWinner() {
  playSound("cheer");
  triggerConfetti(120);
}

// --- ENDGAME SCREEN ---
function endAuctionGame() {
  clearInterval(timerInterval);
  clearTimeout(autoBidTimeout);
  
  const endOverlay = document.getElementById("endgame-modal-overlay");
  const standingsContainer = document.getElementById("endgame-standings-list");
  
  // Calculate final ratings for all teams
  const rankedTeams = activeFranchises.map(team => {
    const squadSize = team.squad.length;
    const avgRating = squadSize > 0 
      ? team.squad.reduce((sum, p) => sum + p.rating, 0) / squadSize
      : 0;
    
    // Score Formula: Average Rating * (0.8 + 0.2 * (squadSize/11))
    const sizeMultiplier = squadSize >= 11 ? 1.0 : (squadSize / 11);
    const score = (avgRating * sizeMultiplier).toFixed(1);
    
    return { ...team, score: parseFloat(score), avgRating, squadSize };
  });
  
  // Sort standings by Score descending
  rankedTeams.sort((a, b) => b.score - a.score);
  
  // Write HTML
  standingsContainer.innerHTML = "";
  rankedTeams.forEach((team, rank) => {
    const isWinner = rank === 0;
    const isUser = team.shortName === userTeam.shortName;
    
    const card = document.createElement("div");
    card.className = `standing-card ${isWinner ? 'winner' : ''}`;
    if (isUser) {
      card.style.borderLeft = "4px solid var(--accent-cyan)";
    }
    
    card.innerHTML = `
      <div class="standing-rank">${isWinner ? '🏆' : rank + 1}</div>
      <div class="team-badge ${team.badgeClass}">${team.shortName}</div>
      <div class="standing-team-name">${team.name} ${isUser ? ' (You)' : ''}</div>
      <div class="standing-score">${team.score} PTS <span style="font-size:10px;color:var(--text-secondary);font-weight:400;">(${team.squadSize} players)</span></div>
    `;
    standingsContainer.appendChild(card);
  });
  
  // Trigger trophy celebration
  celebrateWinner();
  
  // Show modal
  endOverlay.classList.remove("hidden");
  
  // Hook up restart button
  document.getElementById("restart-game-btn").addEventListener("click", () => {
    location.reload();
  });
}
