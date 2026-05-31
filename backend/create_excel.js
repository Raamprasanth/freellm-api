const xlsx = require('xlsx');

// Mock data builder extending the players
const seedPlayers = [
    { id: 1, name: "Virat Kohli", role: "BAT", stats: { match: 267, runs: 8661, avg: "39.5", sr: "135.4" } },
    { id: 2, name: "Jasprit Bumrah", role: "BOWL", stats: { match: 148, wkts: 185, econ: "7.25", avg: "21.9" } },
    { id: 3, name: "MS Dhoni", role: "WK", stats: { match: 279, runs: 5410, avg: "39.8", sr: "139.1" } },
    { id: 4, name: "Rohit Sharma", role: "BAT", stats: { match: 272, runs: 7045, avg: "30.1", sr: "132.8" } },
    { id: 5, name: "Heinrich Klaasen", role: "WK", stats: { match: 50, runs: 1450, avg: "44.1", sr: "172.5" } },
    { id: 6, name: "Pat Cummins", role: "AR", stats: { match: 73, wkts: 81, runs: 670, econ: "8.35", sr: "148.2" } },
    { id: 7, name: "Rashid Khan", role: "BOWL", stats: { match: 136, wkts: 168, econ: "6.85", avg: "20.2" } },
    { id: 8, name: "Suryakumar Yadav", role: "BAT", stats: { match: 165, runs: 4050, avg: "32.8", sr: "147.9" } },
    { id: 9, name: "Mitchell Starc", role: "BOWL", stats: { match: 58, wkts: 69, econ: "8.15", avg: "24.6" } },
    { id: 10, name: "Andre Russell", role: "AR", stats: { match: 142, runs: 2840, wkts: 130, sr: "176.5", econ: "9.1" } },
    { id: 11, name: "Rishabh Pant", role: "WK", stats: { match: 126, runs: 3740, avg: "36.2", sr: "151.4" } },
    { id: 12, name: "Sunil Narine", role: "AR", stats: { match: 191, wkts: 195, runs: 1980, econ: "6.75", sr: "168.4" } },
    { id: 13, name: "Hardik Pandya", role: "AR", stats: { match: 152, runs: 2850, wkts: 78, sr: "148.5", econ: "8.7" } },
    { id: 14, name: "Travis Head", role: "BAT", stats: { match: 40, runs: 1350, avg: "35.2", sr: "178.6" } },
    { id: 15, name: "Shubman Gill", role: "BAT", stats: { match: 118, runs: 3820, avg: "38.5", sr: "137.4" } },
    { id: 16, name: "Yashasvi Jaiswal", role: "BAT", stats: { match: 67, runs: 2150, avg: "34.1", sr: "154.2" } },
    { id: 17, name: "Ravindra Jadeja", role: "AR", stats: { match: 255, runs: 3150, wkts: 172, econ: "7.52", sr: "130.4" } },
    { id: 18, name: "Nicholas Pooran", role: "WK", stats: { match: 91, runs: 2280, avg: "32.4", sr: "161.2" } },
    { id: 19, name: "Glenn Maxwell", role: "AR", stats: { match: 149, runs: 3120, wkts: 45, sr: "158.5", econ: "8.2" } },
    { id: 20, name: "Mohammed Shami", role: "BOWL", stats: { match: 125, wkts: 145, econ: "8.35", avg: "25.8" } },
    { id: 21, name: "Jos Buttler", role: "WK", stats: { match: 122, runs: 4050, avg: "39.2", sr: "149.8" } },
    { id: 22, name: "Kuldeep Yadav", role: "BOWL", stats: { match: 99, wkts: 105, econ: "7.95", avg: "24.2" } },
    { id: 23, name: "Axar Patel", role: "AR", stats: { match: 165, runs: 1920, wkts: 138, econ: "7.15", sr: "133.5" } },
    { id: 24, name: "Trent Boult", role: "BOWL", stats: { match: 111, wkts: 138, econ: "8.22", avg: "24.1" } },
    { id: 25, name: "Yuzvendra Chahal", role: "BOWL", stats: { match: 175, wkts: 225, econ: "7.78", avg: "21.9" } },
    { id: 26, name: "Rinku Singh", role: "BAT", stats: { match: 61, runs: 1240, avg: "34.5", sr: "152.4" } },
    { id: 27, name: "KL Rahul", role: "WK", stats: { match: 147, runs: 5120, avg: "46.2", sr: "136.5" } },
    { id: 28, name: "Kagiso Rabada", role: "BOWL", stats: { match: 95, wkts: 135, econ: "8.38", avg: "21.2" } },
    { id: 29, name: "Matheesha Pathirana", role: "BOWL", stats: { match: 35, wkts: 58, econ: "7.75", avg: "17.8" } },
    { id: 30, name: "Shivam Dube", role: "AR", stats: { match: 80, runs: 1850, avg: "30.2", sr: "146.5", wkts: 8, econ: "9.1" } },
    { id: 31, name: "Abhishek Sharma", role: "BAT", stats: { match: 78, runs: 1840, avg: "27.5", sr: "155.8" } },
    { id: 32, name: "Quinton de Kock", role: "WK", stats: { match: 122, runs: 3580, avg: "32.1", sr: "136.8" } },
    { id: 33, name: "Riyan Parag", role: "BAT", stats: { match: 85, runs: 1620, avg: "27.8", sr: "142.5" } },
    { id: 34, name: "Harshit Rana", role: "BOWL", stats: { match: 36, wkts: 45, econ: "8.75", avg: "22.5" } },
    { id: 35, name: "Mayank Yadav", role: "BOWL", stats: { match: 19, wkts: 28, econ: "6.85", avg: "11.8" } },
    { id: 36, name: "Jake Fraser-McGurk", role: "BAT", stats: { match: 24, runs: 850, avg: "38.2", sr: "238.5" } },
    { id: 37, name: "Shreyas Iyer", role: "BAT", stats: { match: 131, runs: 3580, avg: "32.5", sr: "128.4" } },
    { id: 38, name: "Arshdeep Singh", role: "BOWL", stats: { match: 80, wkts: 98, econ: "8.65", avg: "26.2" } },
    { id: 39, name: "Sam Curran", role: "AR", stats: { match: 74, runs: 1150, wkts: 72, sr: "139.5", econ: "9.2" } },
    { id: 40, name: "Liam Livingstone", role: "AR", stats: { match: 54, runs: 1320, wkts: 18, sr: "165.8", econ: "8.5" } }
];

function generatePlausibleBattingStats(player) {
    const m = player.stats.match;
    const runs = player.stats.runs || 0;
    const avg = parseFloat(player.stats.avg) || 25;
    const sr = parseFloat(player.stats.sr) || 120;
    
    // Guess Innings
    const inn = Math.floor(m * 0.9);
    // Guess Not outs (Avg = Runs / (Inn - NO)) => NO = Inn - (Runs / Avg)
    let no = Math.floor(inn - (runs / avg));
    if (no < 0) no = 0;
    
    // Guess Balls
    const balls = Math.floor((runs / sr) * 100);
    
    // Highest
    let high = 0;
    if (runs > 2000) high = 113;
    else if (runs > 1000) high = 94;
    else if (runs > 500) high = 85;
    else high = 45;

    return {
        Name: player.name,
        Role: player.role,
        Matches: m,
        Innings: inn,
        Runs: runs,
        Balls: balls,
        Highest: high,
        Average: avg,
        "Not Out": no,
        Fours: Math.floor(runs * 0.12),
        Sixes: Math.floor(runs * 0.05),
        Ducks: Math.floor(inn * 0.05),
        "50s": Math.floor(runs / 250),
        "100s": runs > 3000 ? Math.floor(runs / 1500) : 0
    };
}

function generatePlausibleBowlingStats(player) {
    const m = player.stats.match;
    const wkts = player.stats.wkts || 0;
    const econ = parseFloat(player.stats.econ) || 8.0;
    const avg = parseFloat(player.stats.avg) || 28;
    
    // Guess Innings
    const inn = Math.floor(m * 0.95);
    
    // SR = Avg / (Econ / 6)
    const sr = (avg / (econ / 6)).toFixed(1);
    
    // Runs = Wkts * Avg
    const runs = Math.floor(wkts * avg);
    
    // Balls = Wkts * SR
    const balls = Math.floor(wkts * parseFloat(sr));
    
    let bbi = "";
    if (wkts > 100) bbi = "5/14";
    else if (wkts > 50) bbi = "4/21";
    else if (wkts > 20) bbi = "3/18";
    else bbi = "2/25";

    return {
        Name: player.name,
        Role: player.role,
        Matches: m,
        Innings: inn,
        Balls: balls,
        Runs: runs,
        Maidens: Math.floor(inn * 0.05),
        Wickets: wkts,
        Avg: avg,
        Eco: econ,
        SR: sr,
        BBI: bbi
    };
}

const batsmenData = [];
const bowlersData = [];
const allRoundersData = [];

for (const player of seedPlayers) {
    if (player.role === "BAT" || player.role === "WK") {
        batsmenData.push(generatePlausibleBattingStats(player));
    } else if (player.role === "BOWL") {
        bowlersData.push(generatePlausibleBowlingStats(player));
    } else if (player.role === "AR") {
        const bat = generatePlausibleBattingStats(player);
        const bowl = generatePlausibleBowlingStats(player);
        allRoundersData.push({ ...bat, ...bowl });
    }
}

const wb = xlsx.utils.book_new();

const wsBat = xlsx.utils.json_to_sheet(batsmenData);
xlsx.utils.book_append_sheet(wb, wsBat, "Batsman");

const wsBowl = xlsx.utils.json_to_sheet(bowlersData);
xlsx.utils.book_append_sheet(wb, wsBowl, "Bowlers");

const wsAR = xlsx.utils.json_to_sheet(allRoundersData);
xlsx.utils.book_append_sheet(wb, wsAR, "All Rounders");

xlsx.writeFile(wb, "IPL_2025_Mega_Auction_Players.xlsx");

console.log("Updated Excel file generated successfully.");
