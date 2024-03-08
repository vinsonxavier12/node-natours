console.log("Hello from client side");
const mapDoc = document.getElementById("map");
const locations = JSON.parse(mapDoc.dataset.locations);

// var map = L.map("map").setView([51.505, -0.09], 13);
// L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
//   maxZoom: 19,
//   attribution:
//     '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
// }).addTo(map);

var map = L.map("map", {
  zoomDelta: 0.25,
  zoomSnap: 0,
});
var cartodbAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';
var positron = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  {
    attribution: cartodbAttribution,
  },
).addTo(map);
map.setView([51.505, -0.09], 13);
