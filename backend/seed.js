require('dotenv').config();
const mongoose = require('mongoose');
const { Player, Franchise, BidHistory } = require('./models/indexmodel');

const defaultPlayers = [
    { id: 1, name: "Virat Kohli", role: "BAT", rating: 98, nationality: "Indian", basePrice: 200, stats: { match: 252, runs: 8004, avg: "38.7", sr: "131.9" }, desc: "Master Chaser & IPL's All-time Leading Run Scorer" },
    { id: 2, name: "Jasprit Bumrah", role: "BOWL", rating: 98, nationality: "Indian", basePrice: 200, stats: { match: 133, wkts: 165, econ: "7.30", avg: "22.5" }, desc: "The World's Most Lethal Death-Over Bowler" },
    { id: 3, name: "MS Dhoni", role: "WK", rating: 97, nationality: "Indian", basePrice: 200, stats: { match: 264, runs: 5243, avg: "39.1", sr: "137.5" }, desc: "Legendary Captain Cool, Finisher & Gloveman" },
    { id: 4, name: "Rohit Sharma", role: "BAT", rating: 96, nationality: "Indian", basePrice: 200, stats: { match: 257, runs: 6628, avg: "29.7", sr: "131.2" }, desc: "The Hitman - 5-time IPL Winning Captain" },
    { id: 5, name: "Heinrich Klaasen", role: "WK", rating: 96, nationality: "Overseas", basePrice: 200, stats: { match: 35, runs: 998, avg: "43.4", sr: "168.3" }, desc: "Most Destructive Spin Basher in World Cricket" },
    { id: 6, name: "Pat Cummins", role: "AR", rating: 96, nationality: "Overseas", basePrice: 200, stats: { match: 58, wkts: 63, runs: 512, econ: "8.45" }, desc: "World Cup Winning Skipper & Clutch All-rounder" },
    { id: 7, name: "Rashid Khan", role: "BOWL", rating: 97, nationality: "Overseas", basePrice: 200, stats: { match: 121, wkts: 149, econ: "6.73", avg: "20.8" }, desc: "A four-over bank of spin wizardry & handy hitter" },
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

const defaultFranchises = [
    { shortName: "CSK", name: "Chennai Super Kings", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "MI", name: "Mumbai Indians", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "RCB", name: "Royal Challengers Bangalore", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "KKR", name: "Kolkata Knight Riders", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "DC", name: "Delhi Capitals", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "RR", name: "Rajasthan Royals", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "PBKS", name: "Punjab Kings", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "SRH", name: "Sunrisers Hyderabad", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "LSG", name: "Lucknow Super Giants", purse: 10000, squad: [], RTM: 1, isAI: true },
    { shortName: "GT", name: "Gujarat Titans", purse: 10000, squad: [], RTM: 1, isAI: true }
];

async function seedDatabase() {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }

        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,  // fail fast after 10s
            dbName: 'ipl_auction'             // explicit DB name
        });
        console.log("✅ Connected Successfully.");

        console.log("Clearing existing data...");
        await Player.deleteMany({});
        await Franchise.deleteMany({});
        await BidHistory.deleteMany({});

        console.log("Seeding Players...");
        await Player.insertMany(defaultPlayers);
        
        console.log("Seeding Franchises...");
        await Franchise.insertMany(defaultFranchises);

        console.log("✅ Database Seeded Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error.message);
        if (error.message.includes('ECONNREFUSED') || error.message.includes('timed out') || error.message.includes('Server selection')) {
            console.error("\n💡 FIX: Go to MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)");
        }
        process.exit(1);
    }
}

seedDatabase();
