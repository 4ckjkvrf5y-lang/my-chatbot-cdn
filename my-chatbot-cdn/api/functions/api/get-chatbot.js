const { createClient } = require('@supabase/supabase-js');

// Initialize your Supabase client using environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
    // Enable CORS rules so any client website can call this script
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the browser security pre-flight check
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Vercel handles queries via req.query
    const clientId = req.query.id;

    if (!clientId) {
        return res.status(400).json({ error: "Missing client ID" });
    }

    try {
        // 1. Pull status and chatbot config from Supabase
        const { data, error } = await supabase
            .from('clients')
            .select('status, chatbot_config')
            .eq('client_id', clientId)
            .single();

        // 2. The Gatekeeper Check: If suspended, do not deliver the chatbot
        if (error || !data || data.status === 'suspended') {
            res.setHeader('Content-Type', 'application/javascript');
            return res.status(200).send(`console.warn("Chatbot disabled for ${clientId}: Pending payment verification.");`);
        }

        // 3. If Active: Build the payload injection script
        const activeChatbotScript = `
        (function() {
            window.ChatbotConfig = ${JSON.stringify(data.chatbot_config)};
            console.log("Chatbot verified and loading rules for ${clientId}...");
            
            const script = document.createElement('script');
            script.src = 'https://your-live-compiled-widget-url.com'; 
            script.async = true;
            document.head.appendChild(script);
        })();`;

        res.setHeader('Content-Type', 'application/javascript');
        return res.status(200).send(activeChatbotScript);

    } catch (err) {
        res.setHeader('Content-Type', 'application/javascript');
        return res.status(200).send(`console.error("Chatbot infrastructure error.");`);
    }
};
