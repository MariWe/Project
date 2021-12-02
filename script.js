let m = [];
let n = [];
let arrayLat = [];
let arrayLon = [];
let points;
let lat, lon, zielLat, zielLon, lat1, lon1, lat2, lon2, p;
let R = 6378137;

window.onload = function () {

    readGraphData().then(function (text) {
        let algo = new RoutingAlgorithm(text);
        points = algo.GetDijkstraSolution("E", "P_024", 0.0);
        return points;
    }).then (function (points){
        createPoints(points);
    })

    GetCurrentPosition().then(function (position) {
        GPSrechner(position);
        //throw new Error("test");
    }).then(function () {
        Mittelwert();
    }).catch((ex) => {
        console.error(ex);
    })


    function Pointing() {
        var pfeil = document.querySelector('#pfeil');
        var position = one.object3D.position;
        pfeil.object3D.lookAt(new THREE.Vector3(position.x, position.y, position.z));
    }

    function createPoints() {
        for (i = 0; i < points.length; i++) {
            m[i] = document.createElement('a-sphere');
            document.querySelector('a-scene').appendChild(m[i]);
            m[i].setAttribute('radius', '1');
            m[i].setAttribute('color', 'rgb(55, 63, 120)');
            m[i].setAttribute('id', [i]);
            m[i].setAttribute('scale', '0.1 0.1 0.1');
        }
    }

    function GetCurrentPosition() {
        const promise2 = new Promise((resolve, reject) => {
            try {
                navigator.geolocation.getCurrentPosition(function (position) {
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                    resolve({ lat, lon });
                })
            } catch (error) {
                reject(error);
            }
        });
        return promise2;
    }

    function Mittelwert() {
        document.getElementById(0).setAttribute('id', 'one');
        document.getElementById(11).setAttribute('data-next', 'null');
        navigator.geolocation.watchPosition(function (position) {
            arrayLat.push(position.coords.latitude);
            arrayLon.push(position.coords.longitude);
            let sLat = 0;
            let sLon = 0;
            if (arrayLat.length <= 10 && arrayLon.length <= 10) {
                for (let i = 0; i < arrayLat.length; i++) {
                    sLat += arrayLat[i];
                    sLon += arrayLon[i];
                }
                lat1 = sLat / arrayLat.length;
                lon1 = sLon / arrayLat.length;
                Navigation();
                Pointing();
            }
            if (arrayLat.length === 10 && arrayLon.length === 10) {
                let ie = arrayLat.shift();
                let il = arrayLon.shift();
            }
        });
        return lat1, lon1;
    }

    function GPSrechner() {

        for (i = 0; i < points.length; i++) {
            //offsets in meters
            let dn = points[i][0];
            let de = points[i][2];

            //Coordinate offsets in radians
            let dLat = dn / R;
            let dLon = de / (R * Math.cos(Math.PI * lat / 180));

            //OffsetPosition, decimal degrees
            let latO = lat + dLat * 180 / Math.PI;
            let lonO = lon + dLon * 180 / Math.PI;

            document.getElementById(i).setAttribute('gps-entity-place', `latitude: ${latO}; longitude: ${lonO};`);
            document.getElementById(i).setAttribute('data-lat', `${latO}`);
            document.getElementById(i).setAttribute('data-lon', `${lonO}`);
            document.getElementById(i).setAttribute('data-next', `${i + 1}`);
        }
    }

    function zielDistanz(lat, lon) {
        const R = 6371e3; // metres
        const φ1 = lat * Math.PI / 180; // φ, λ in radians
        const φ2 = 50.82233925355029 * Math.PI / 180;
        const Δφ = (50.82233925355029 - lat) * Math.PI / 180;
        const Δλ = (12.939959823277517 - lon) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        dis = R * c; // in metres
        return dis;
    }

    //"Navigation"
    function Navigation() {
        next = document.getElementById(one.dataset.next);
        lat2 = parseFloat(one.dataset.lat);
        lon2 = parseFloat(one.dataset.lon);
        zielDistanz(lat1, lon1, zielLat, zielLon);
        Distanz(lat1, lon1, lat2, lon2);
        Display();
        if (d < 5) {
            if (next.dataset.next === "null") {
                const div = document.querySelector('#demo');
                div.innerText = "Sie haben Ihr Ziel erreicht!";
            }
            else {
                one = next;
                obj = next;
            }
        }
    }

    function Display() {
        const div = document.querySelector('#demo');
        div.innerText = "Distanz bis zum Ziel: " + dis.toFixed(2) + "m";
    }

    function Distanz(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        d = R * c; // in metres
        return d;
    }
}
