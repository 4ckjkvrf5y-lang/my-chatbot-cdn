const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Vercel parses the incoming webhook data directly into req.body
        const event = req.body;
        const eventType = event.type;
        
        // Adjust these selectors depending on how Make.com or Stripe formats your customer tracking values
        const clientId = event.data?.object?.metadata?.client_id || event.data?.object?.client_id;

        if (!clientId) {
            return res.status(400).json({ error: "No client ID found in webhook payload data metadata." });
        }

        let activeStatus = null;
        if (eventType === "invoice.payment_failed" || eventType === "customer.subscription.deleted") {
            activeStatus = "suspended";
        } else if (eventType === "invoice.payment_succeeded") {
            activeStatus = "active";
        }

        if (activeStatus === null) {
            return res.status(200).json({ status: "Event ignored" });
        }

        // 2. Execute Database Update on Supabase
        const { error } = await supabase
            .from('clients')
            .update({ status: activeStatus })
            .eq('client_id', clientId);

        if (error) throw new Error(`Supabase Error: ${error.message}`);

        return res.status(200).json({ message: `Updated ${clientId} database status to ${activeStatus}` });

    } catch (err) {
        console.error("Webhook processing error:", err.message);
        return res.status(500).json({ error: err.message });
    }
};
