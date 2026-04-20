const express = require('express');
const cors = require('cors');
const { Rcon } = require('rcon-client');

const app = express();
app.use(cors()); // აძლევს საიტს წვდომის უფლებას
app.use(express.json());

/**
 * ⚙️ კონფიგურაცია
 * შეცვალეთ ეს მონაცემები თქვენი სერვერის მიხედვით
 */
const CONFIG = {
    mc_host: "localhost",      // Minecraft სერვერის IP (მაგ: 123.123.123.123)
    mc_rcon_port: 25575,       // RCON პორტი (default: 25575)
    mc_rcon_password: "YOUR_PASSWORD", // RCON პაროლი server.properties-დან
    secret_key: "YOUR_SECRET_KEY",     // იგივე გასაღები რაც საიტზე მივუთითეთ
    web_port: 3000             // Backend-ის პორტი
};

app.post('/give-reward', async (req, res) => {
    const { player, amount, secret } = req.body;

    // უსაფრთხოების შემოწმება
    if (secret !== CONFIG.secret_key) {
        console.warn(`[!] Unauthorized access attempt for player: ${player}`);
        return res.status(403).json({ success: false, error: "Invalid Secret Key" });
    }

    if (!player || !amount) {
        return res.status(400).json({ success: false, error: "Missing data" });
    }

    try {
        console.log(`[+] Connecting to MC Server to give ${amount} GEL to ${player}...`);
        
        // RCON-ით დაკავშირება
        const rcon = await Rcon.connect({
            host: CONFIG.mc_host,
            port: CONFIG.mc_rcon_port,
            password: CONFIG.mc_rcon_password
        });

        // ბრძანების გაგზავნა (EssentialsX Economy-სთვის)
        // შეგიძლიათ შეცვალოთ ბრძანება თქვენი პლაგინის მიხედვით
        const response = await rcon.send(`eco give ${player} ${amount}`);
        console.log(`[Server Response]: ${response}`);
        
        await rcon.end();

        res.json({ success: true, message: `Reward sent to ${player}!` });
    } catch (err) {
        console.error("[!] RCON Error:", err.message);
        res.status(500).json({ success: false, error: "Could not connect to Minecraft Server" });
    }
});

app.listen(CONFIG.web_port, () => {
    console.log(`\n🚀 NovaCraft Casino Backend is running!`);
    console.log(`🔗 Listening for wins on port ${CONFIG.web_port}`);
    console.log(`🛠️ Make sure RCON is enabled in your server.properties\n`);
});
