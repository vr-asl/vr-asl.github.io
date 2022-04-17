const tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let player;
function onYouTubeIframeAPIReady() {
    if (isNaN(videoIndex)) {
        return;
    }

    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videos[videoIndex].id,
        playerVars: {
            playsinline: 1,
            modestbranding: 1,
            showinfo: 0,
            wmode: 'transparent',
        },
    });
}

function prepareVideo() {
    if (isNaN(videoIndex)) {
        return;
    }

    document.getElementById('menu').remove();

    let line;
    let data = [];

    fetchData(videoIndex).then(d => (data = d));

    function animationFrame() {
        const path = [];
        let dist = 0;

        if (player && player.getCurrentTime && player.getPlayerState && player.getPlayerState() === 1) {
            const time = player.getCurrentTime() * 1000;
            let current;
            for (let i = SKIP_FIRST_X_GPS; i < data.length; i++) {
                const pos = {
                    lat: parseFloat(data[i].Latitude),
                    lng: parseFloat(data[i].Longitude),
                };

                if (data[i].Milliseconds > time) {
                    current = data[i - 1];
                    break;
                } else {
                    if (!isNaN(pos.lat) && !isNaN(pos.lng)) {
                        path.push(pos);

                        const d1 = path[path.length - 1];
                        const d2 = path[path.length - 2];

                        if (d1 && d2) {
                            dist += distance(d1.lat, d1.lng, d2.lat, d2.lng);
                        }
                    }
                }
            }

            if (current) {
                document.getElementById('speed').innerHTML = `${Math.round(current.Speed * 3.6)} km/h`;
                document.getElementById('speed_mph').innerHTML = `${Math.round(
                    current.Speed * 3.6 * 0.621371192,
                )} mi/h`;
                document.getElementById('altitude').innerHTML = `${Math.round(current.Altitude)} m`;
                document.getElementById('distance').innerHTML = `${(dist / 1000).toFixed(2)} km`;
                document.getElementById('distance_m').innerHTML = `${((dist / 1000) * 0.621371192).toFixed(2)} mi`;

                let t = videos[videoIndex].time;
                let passedTime = time;
                if (time / 1000 > current.StartTimeSec && !!current.TimeIrl) {
                    t = current.TimeIrl;
                    passedTime = time - current.StartTimeSec * 1000;
                }

                const startTime = t.h * 60 * 60 + t.m * 60;
                const currentTime = (startTime + (passedTime * videos[videoIndex].speed) / 1000) / 60;
                const hours = Math.floor(currentTime / 60);
                const minutes = Math.floor(currentTime - hours * 60);

                document.getElementById('time').innerHTML = `${hours % 24}:${minutes < 10 ? '0' : ''}${minutes % 60}`;

                const timePassed = (time * videos[videoIndex].speed) / 1000 / 60;
                const hours_passed = Math.floor(timePassed / 60);
                const minutes_passed = Math.floor(timePassed - hours_passed * 60);
                document.getElementById('time_passed').innerHTML = `${hours_passed}:${minutes_passed < 10 ? '0' : ''}${
                    minutes_passed % 60
                }`;

                if (line) {
                    line.setPath(path);
                } else {
                    line = new google.maps.Polyline({
                        path: path,
                        geodesic: true,
                        strokeColor: '#e15d3a',
                        strokeOpacity: 1.0,
                        strokeWeight: 2,
                    });

                    line.setMap(map);
                }

                if (path.length > 0) {
                    map.setZoom(16);
                    map.setCenter(new google.maps.LatLng(path[path.length - 1].lat, path[path.length - 1].lng));
                }
            }
        }
    }

    setInterval(() => animationFrame(), 100);
}

startPromise.then(() => prepareVideo());
