async function generateRules() {
  const input = document.getElementById("input").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    output.textContent = "Please describe your server first.";
    return;
  }

  output.textContent = "Generating rules...";

  try {
    const response = await fetch("PASTE-YOUR-WORKER-URL-HERE", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverDescription: input
      })
    });

    const data = await response.json();

    if (!response.ok) {
      output.textContent = data.error || "Something went wrong.";
      return;
    }

    output.textContent = data.result;
  } catch (error) {
    output.textContent = "Failed to connect to the AI server.";
    console.error(error);
  }
}
