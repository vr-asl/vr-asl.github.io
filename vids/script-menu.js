async function fetchVideos() {
    let data = [];

    for (const index in videos) {
        const resp = await fetchData(index);
        data.push({
            ...videos[index],
            gps: resp,
        });
    }

    return data;
}

async function prepareMenu() {
    if (!isNaN(videoIndex)) {
        return;
    }

    document.getElementById('to-menu').remove();

    let globalZIndex = 0;

    document.body.classList.add('menu');

    const data = await fetchVideos();

    const bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < data.length; i++) {
        const path = [];
        let dist = 0;

        for (let j = SKIP_FIRST_X_GPS + (data[i].gpsAdditionalSkip || 0); j < data[i].gps.length; j++) {
            const lat = parseFloat(data[i].gps[j].Latitude);
            const lng = parseFloat(data[i].gps[j].Longitude);

            if (data[i].gps[j].Milliseconds > data[i].length * 1000) {
                break;
            }

            if (!isNaN(lat) && !isNaN(lng)) {
                bounds.extend({ lat, lng });
                path.push({ lat, lng });

                const d1 = path[path.length - 1];
                const d2 = path[path.length - 2];

                if (d1 && d2) {
                    dist += distance(d1.lat, d1.lng, d2.lat, d2.lng);
                }
            }
        }

        data[i].dist = dist;
        data[i].line = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: '#e15d3a',
            strokeOpacity: 0.6,
            strokeWeight: 4,
            zIndex: globalZIndex++,
        });
        data[i].line.setMap(map);

        const btn = document.createElement('div');
        btn.classList.add('video-tile');
        btn.classList.add('carousel-cell');
        btn.style.backgroundImage = `url(${getVideoThumbnailUrl(data[i].id)})`;

        btn.addEventListener('mouseenter', () => {
            data[i].line.setOptions({
                strokeOpacity: 1,
                strokeWeight: 5,
                strokeColor: '#ffa73c',
                zIndex: globalZIndex++,
            });
        });

        btn.addEventListener('mouseleave', () => {
            data[i].line.setOptions({
                strokeOpacity: 0.6,
                strokeWeight: 4,
                strokeColor: '#e15d3a',
            });
        });

        const dateText = document.createElement('div');
        dateText.classList.add('date-text');
        dateText.innerHTML = `${data[i].date}`;
        btn.append(dateText);

        const typeText = document.createElement('i');
        typeText.classList.add('type-text');
        typeText.classList.add('fa-solid');
        switch (data[i].type) {
            case 'bicycle':
                typeText.classList.add('fa-person-biking');
                break;
            case 'walking':
                typeText.classList.add('fa-person-walking');
                break;
            case 'unicycle':
                typeText.classList.add('fa-tire');
                break;
            default:
                typeText.classList.add('fa-question');
                break;
        }
        btn.append(typeText);

        const speedText = document.createElement('div');
        speedText.classList.add('speed-text');
        speedText.innerHTML = `${data[i].speed}x`;
        btn.append(speedText);

        const timeText = document.createElement('div');
        timeText.classList.add('time-text');
        const h = Math.floor(data[i].length / 60 / 60);
        const m = Math.floor((data[i].length - h * 60 * 60) / 60);
        const s = data[i].length - h * 60 * 60 - m * 60;
        timeText.innerHTML = `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        btn.append(timeText);

        const distanceText = document.createElement('div');
        distanceText.classList.add('distance-text');
        distanceText.innerHTML = `${(data[i].dist / 1000).toFixed(2)} km`;
        btn.append(distanceText);

        const distanceMiText = document.createElement('div');
        distanceMiText.classList.add('distance-mi-text');
        distanceMiText.innerHTML = `${data[i].speed}x`;
        distanceMiText.innerHTML = `${((data[i].dist / 1000) * 0.621371192).toFixed(2)} mi`;
        btn.append(distanceMiText);

        const menu = document.getElementById('menu');
        menu.append(btn);
    }

    const flickity = new Flickity('.carousel', {
        groupCells: true,
    });

    flickity.on('staticClick', (event, pointer, cellElement, cellIndex) => {
        if (cellIndex == null) {
            return;
        }
        const url = window.location.href.split('#');
        window.location = url[0] + '?x=1#' + cellIndex;
    });

    map.fitBounds(bounds, 50);

    document.getElementById('stuff').classList.remove('loading');
    document.getElementById('loader').remove();
}

startPromise.then(() => prepareMenu());
