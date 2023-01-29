const socket = io();

const form = document.getElementById("input-form");
const btnLocation = document.getElementById("btn-location");
const messages = document.getElementById("messages");

//Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// username and room
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// console.log("username:", username);
// console.log("room:", room);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = form.querySelector("input");
  const submitBtn = form.querySelector("button");
  submitBtn.setAttribute("disabled", "disabled");
  socket.emit("broadcastMsg", e.target.elements.inp.value, () => {
    submitBtn.removeAttribute("disabled");
    inp.value = "";
    inp.focus();
  });
});

socket.on("msg", (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    time: moment(msg.time).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.on("newMsg", (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    time: moment(msg.time).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (msg) => {
  console.log("link:", msg);
  const html = Mustache.render(locationTemplate, {
    username: msg.username,
    link: msg.text,
    time: moment(msg.time).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

btnLocation.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser");

  btnLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const latLong = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("sendLocation", latLong, (msg) => {
      console.log(msg);
      btnLocation.removeAttribute("disabled");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.getElementById("sidebar").innerHTML = html;
});

// socket.on("updatedCount", (count) => {
//   console.log("count:", count);
// });

// document.getElementById("inc").addEventListener("click", () => {
//   socket.emit("inc");
// });
