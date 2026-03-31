function generateRules() {
  const input = document.getElementById("input").value;

  const output = `
1. Respect all players
2. No griefing
3. No hacking
4. Keep chat appropriate

(Server type: ${input})
  `;

  document.getElementById("output").textContent = output;
}
