(function() {
    // 1. GET THE CLIENT ID FROM THE WEBPAGE
    const clientId = window.YourChatbotConfig?.clientId;
    if (!clientId) {
        console.error("Chatbot Error: Missing Client ID configuration.");
        return;
    }

    // 2. INJECT OFFICIAL SUPABASE SDK VIA JSDELIVR
    const supabaseScript = document.createElement('script');
    supabaseScript.src = "https://jsdelivr.net";
    document.head.appendChild(supabaseScript);

    supabaseScript.onload = async function() {
        // REPLACE WITH YOUR ACTUAL PROJECTS DETAILS FROM SUPABASE API SETTINGS
        const SUPABASE_URL = "https://htenfwgtezkodjltfewe.supabase.co"; 
        const SUPABASE_ANON_KEY = "sb_publishable_IQB8d5QJZ9JZ92igMzdEiQ_2l35tJtL"; 

        const { createClient } = supabase;
        const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        try {
            // 3. PING THE CLIENT TABLE DIRECTLY
            const { data, error } = await _supabase
                .from('clients')
                .select('status')
                .eq('client_id', clientId)
                .single();

            if (error) throw error;

            // 4. THE KILL-SWITCH GATEKEEPER CHECK
            if (!data || data.status === 'suspended') {
                console.warn(`Chatbot disabled for ${clientId}: Pending payment verification.`);
                return; // Drops execution immediately. The chatbot widget will never load.
            }

            // 5. SUCCESS: IF ACTIVE, RENDER THE ACTUAL CHATBOT CODE HERE
            console.log(`Chatbot verified! Building conversational asset widgets for ${clientId}...`);
            
            // Put your actual front-end chatbot interface building loop code right here:
            // (e.g. creating the chat bubble element, injecting CSS rules, opening websocket connections)

        } catch (err) {
            console.error("Chatbot initialization security check failed:", err.message);
        }
    };
})();
