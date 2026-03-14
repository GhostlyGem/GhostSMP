const ip = document.getElementById("ip");

if (ip) {
  ip.addEventListener("click", () => {
    navigator.clipboard.writeText("mc.ghostsurvival.net");
    alert("Server IP copied!");
  });
}

fetch("https://api.mcsrvstat.us/2/mc.ghostsurvival.net")
.then(res => res.json())
.then(data => {

  const status = document.getElementById("status");
  const players = document.getElementById("players");

  if (!status || !players) return;

  if (data.online) {

    status.innerHTML = "Status: 🟢 Online";

    players.innerHTML =
      "Players: " + data.players.online + " / " + data.players.max;

  } else {

    status.innerHTML = "Status: 🔴 Offline";
    players.innerHTML = "Players: 0";

  }

})
.catch(err => {
  console.error(err);
});
