const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  // Only allow POST requests from Stripe
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const stripeEvent = JSON.parse(event.body);
    const eventType = stripeEvent.type;
    const session = stripeEvent.data.object;

    // Retrieve the client ID passed during Stripe Checkout
    const clientId = session.client_reference_id || session.metadata?.client_id;

    if (!clientId) {
      return { statusCode: 200, body: "No client ID found in event metadata." };
    }

    // Determine target status
    let activeStatus = null;
    if (eventType === "invoice.payment_failed" || eventType === "customer.subscription.deleted") {
      activeStatus = false; // FAILSAFE: Turn off bot
    } else if (eventType === "invoice.payment_succeeded") {
      activeStatus = true;  // Turn back on
    }

    if (activeStatus === null) {
      return { statusCode: 200, body: "Event ignored." };
    }

    // Initialize GitHub API client to update active-clients.json automatically
    const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const path = "active-clients.json";

    // 1. Get current active-clients.json content from GitHub repository
    const { data: fileData } = await octokit.repos.getContent({ owner, repo, path });
    const content = Buffer.from(fileData.content, "base64").toString("utf-8");
    const activeClients = JSON.parse(content);

    // 2. Update the specific client's active status
    if (!activeClients[clientId]) {
      activeClients[clientId] = {};
    }
    activeClients[clientId].active = activeStatus;

    // 3. Commit updated active-clients.json back to GitHub
    const updatedContent = Buffer.from(JSON.stringify(activeClients, null, 2)).toString("base64");
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Automated status update for ${clientId}: active = ${activeStatus}`,
      content: updatedContent,
      sha: fileData.sha,
    });

    return { statusCode: 200, body: `Updated ${clientId} active status to ${activeStatus}` };
  } catch (err) {
    console.error("Webhook processing error:", err);
    return { statusCode: 500, body: err.message };
  }
};