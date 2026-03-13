const ipElement = document.getElementById("ip")

ipElement.addEventListener("click", () => {
navigator.clipboard.writeText("ghostsurvival.net")
alert("Server IP copied!")
})

fetch("https://api.mcsrvstat.us/2/ghostsurvival.net")
.then(res => res.json())
.then(data => {

const status = document.getElementById("status")
const players = document.getElementById("players")

if(data.online){

status.innerHTML = "Status: 🟢 Online"
players.innerHTML = "Players: " + data.players.online + "/" + data.players.max

}else{

status.innerHTML = "Status: 🔴 Offline"

}

})
