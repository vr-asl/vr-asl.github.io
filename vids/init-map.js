let map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: { lat: 0, lng: -180 },
        mapTypeId: 'satellite',
        tilt: 45,
        disableDefaultUI: true,
        keyboardShortcuts: false,
    });

    startResolve();
}

let startResolve;
const startPromise = new Promise(resolve => {
    startResolve = resolve;
});
window.initMap = initMap;
