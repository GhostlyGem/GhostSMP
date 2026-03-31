console.log("tools.js loaded");

async function generateRules() {
  console.log("generateRules clicked");

  const input = document.getElementById("input").value.trim();
  const output = document.getElementById("output");

  output.textContent = "Button clicked.";

  if (!input) {
    output.textContent = "Please describe your server first.";
    return;
  }

  output.textContent = "Generating rules...";

  try {
    const response = await fetch("https://ghostsurvival-api.prestonclement566.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverDescription: input
      })
    });

    console.log("Response received:", response);

    const data = await response.json();
    console.log("JSON data:", data);

    if (!response.ok) {
      output.textContent = data.error || "Something went wrong.";
      return;
    }

    output.textContent = data.result;
  } catch (error) {
    console.error("Fetch failed:", error);
    output.textContent = "Failed to connect to the AI server.";
  }
}
