const { createClient } = require('@supabase/supabase-js');

// 1. Initialize Supabase using your Netlify environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const stripeEvent = JSON.parse(event.body);
    const eventType = stripeEvent.type;
    const session = stripeEvent.data.object;

    // Pull the unique client identifier you pass during checkout
    const clientId = session.client_reference_id || session.metadata?.client_id;

    if (!clientId) {
      return { statusCode: 200, body: "No client ID found in event metadata." };
    }

    // Determine target status string for our database
    let activeStatus = null;
    if (eventType === "invoice.payment_failed" || eventType === "customer.subscription.deleted") {
      activeStatus = "suspended"; 
    } else if (eventType === "invoice.payment_succeeded") {
      activeStatus = "active";  
    }

    if (activeStatus === null) {
      return { statusCode: 200, body: "Event ignored." };
    }

    // 2. Direct Database Update (Replaces all the slow GitHub/Octokit code)
    const { error } = await supabase
      .from('clients')
      .update({ status: activeStatus })
      .eq('client_id', clientId); // Matches the database column to your Stripe metadata ID

    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }

    return { statusCode: 200, body: `Updated ${clientId} database status to ${activeStatus}` };
  } catch (err) {
    console.error("Webhook processing error:", err);
    return { statusCode: 500, body: err.message };
  }
};
