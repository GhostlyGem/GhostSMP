function generateRules() {
  const input = document.getElementById("input").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    output.textContent = "Please describe your server first.";
    return;
  }

  const rules = [
    "1. Respect all players and staff.",
    "2. No griefing, stealing, or unwanted destruction.",
    "3. No hacked clients, x-ray, duping, or unfair advantages.",
    "4. Keep chat appropriate and avoid harassment.",
    "5. Follow all staff instructions during gameplay and events.",
    "6. Use common sense and help keep the server fun for everyone.",
    "",
    "Server details provided:",
    input
  ];

  output.textContent = rules.join("\n");
}
