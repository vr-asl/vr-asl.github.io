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

    for (const dataFile of dataFiles) {
        const resp = await fetch(dataFile.file);
        const text = (await resp.text()).replace(/\r/g, '');
        const json = csvToJson(text);
        json.forEach(line => {
            line.Milliseconds =
                (parseInt(line.Milliseconds, 10) + (dataFile.adjust || 0)) / videos[index].speed + (dataFile.time + previousTimeTotal) * 1000;
            line.TimeIrl = dataFile.timeIrl;
            line.StartTimeSec = dataFile.time + previousTimeTotal;
        });
        previousTimeTotal += dataFile.time;
        data = [...data, ...json];
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


