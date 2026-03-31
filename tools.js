async function generateRules() {
  const input = document.getElementById("input").value.trim();
  const output = document.getElementById("output");

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

    const data = await response.json();
    console.log("Worker response:", data);

    if (!response.ok) {
      output.textContent = data.error || "Something went wrong.";
      return;
    }

    output.textContent = data.result;
  } catch (error) {
    console.error(error);
    output.textContent = "Failed to connect to the AI server.";
  }
}

const WEEKLY_LIMIT = 3;
const RESET_DAYS = 7;

function getUsageData() {
  const saved = localStorage.getItem("ghostToolsUsage");

  if (!saved) {
    const freshData = {
      count: 0,
      startDate: Date.now()
    };
    localStorage.setItem("ghostToolsUsage", JSON.stringify(freshData));
    return freshData;
  }

  const data = JSON.parse(saved);
  const now = Date.now();
  const daysPassed = (now - data.startDate) / (1000 * 60 * 60 * 24);

  if (daysPassed >= RESET_DAYS) {
    const resetData = {
      count: 0,
      startDate: now
    };
    localStorage.setItem("ghostToolsUsage", JSON.stringify(resetData));
    return resetData;
  }

  return data;
}

function saveUsageData(data) {
  localStorage.setItem("ghostToolsUsage", JSON.stringify(data));
}

function getRemainingUses() {
  const data = getUsageData();
  return Math.max(0, WEEKLY_LIMIT - data.count);
}

async function generateRules() {
  const input = document.getElementById("input").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    output.textContent = "Please describe your server first.";
    return;
  }

  const usage = getUsageData();

  if (usage.count >= WEEKLY_LIMIT) {
    output.textContent = "You have used all 3 free generations for this week.";
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

    const data = await response.json();

    if (!response.ok) {
      output.textContent = data.error || "Something went wrong.";
      return;
    }

    usage.count += 1;
    saveUsageData(usage);

    const remaining = getRemainingUses();
    output.textContent = `${data.result}\n\nFree generations remaining this week: ${remaining}`;
  } catch (error) {
    output.textContent = "Failed to connect to the AI server.";
    console.error(error);
  }
}


function updateUsageDisplay() {
  const usageInfo = document.getElementById("usage-info");
  if (!usageInfo) return;

  const remaining = getRemainingUses();
  usageInfo.textContent = `Free plan: ${remaining} of ${WEEKLY_LIMIT} generations remaining this week.`;
}

updateUsageDisplay();
