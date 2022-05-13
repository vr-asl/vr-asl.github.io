const videoIndex = parseInt((document.location.hash || '').substring(1, 1000));

const SKIP_FIRST_X_GPS = 500;

function csvToJson(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j];
        }

        result.push(obj);
    }

    return result;
}

function getVideoThumbnailUrl(id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

async function fetchData(index) {
    let data = [];
    const dataFiles = videos[index].data;
    let previousTimeTotal = 0;
    const startTime = (videos[index].time.h * 60 * 60 + videos[index].time.m * 60) * 1000;

    for (const dataFile of dataFiles) {
        const resp = await fetch(dataFile.file);
        const text = (await resp.text()).replace(/\r/g, '');
        let json;

        dataFile.time = dataFile.time || 0;

        if (!dataFile.gpx) {
            json = csvToJson(text);
        } else {
            const converted = xmlToJSON.parseString(text);
            const pts = converted.gpx[0].trk[0].trkseg[0].trkpt;
            json = pts.map(pt => {
                const date = new Date(pt.time[0]._text);
                const sec = date.getUTCSeconds();
                const min = date.getUTCMinutes();
                const hr = date.getUTCHours();

                const ms = (hr * 60 * 60 + min * 60 + sec) * 1000;
                const adjustedMs = ms + dataFile.gpxAdjust || 0;
                const msFinal = adjustedMs - startTime;

                return {
                    Altitude: pt.ele[0]._text,
                    Speed: pt.speed[0]._text,
                    Milliseconds: msFinal,
                    Latitude: pt._attr.lat._value,
                    Longitude: pt._attr.lon._value,
                }
            });
        }

        json.forEach(line => {
            line.Milliseconds =
                (parseInt(line.Milliseconds, 10) + (dataFile.adjust || 0)) / videos[index].speed + (dataFile.time + previousTimeTotal) * 1000;
            line.TimeIrl = dataFile.timeIrl;
            line.StartTimeSec = dataFile.time + previousTimeTotal;
        });
        json = json.filter(item => item.Milliseconds >= 0);
        previousTimeTotal += dataFile.time;
        data = [...data, ...(videos[index].gpsRemoveFromEnd ? json.slice(0,  -videos[index].gpsRemoveFromEnd) : json)];
    }

    return data;
}

function distance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const l1 = (lat1 * Math.PI) / 180;
    const l2 = (lat2 * Math.PI) / 180;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(l1) * Math.cos(l2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}


