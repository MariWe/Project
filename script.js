let m = [];
let n = [];
let arrayLat = [];
let arrayLon = [];
let points;
let lat, lon, zielLat, zielLon, lat1, lon1, lat2, lon2, p;
let R = 6378137;
let dong = new Audio();
dong.src = 'collect.mp3';
dong.volume = 0.05;
let ding = new Audio();
ding.src = 'complete.wav';
ding.volume = 0.1;

window.onload = function () {
//Verkettete Promise für den asynchronen Ablauf der Funktionen von
    readGraphData().then(function (text) {
        let algo = new RoutingAlgorithm(text);
        points = algo.GetDijkstraSolution("E", "P_024", 0.0);
        return points;
    }).then(function (points) {
        createPoints(points);
    }).then(function () {
        GetCurrentPosition().then(function (position, points) {
            GPSrechner(position, points);
        }).then(function () {
            Mittelwert();
        }).catch((ex) => {
            console.error(ex);
        })
    })
    //Ausrichtung der Pfeils
    function Pointing() {
        var pfeil = document.querySelector('#pfeil');
        var position = one.object3D.position;
        pfeil.object3D.lookAt(new THREE.Vector3(position.x, position.y, position.z));
    }
    //Erstellen der Punkte
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
    //AKtuelle Position 
    function GetCurrentPosition() {
                geolocation.getCurrentPosition(function (position) {
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                    console.log(lat, lon);
                })
            }
    
    //Mittelwertberechnung der aktuellen GPS Daten um "springen" der Objekte zu minnimieren 
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
    //Umrechnung der lokalen Koordinaten in lat, lon
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
            //Verteilen der erforderlichen Attribute für die Navigation
            //Data-set Attribute und gps-entity-place
            document.getElementById(i).setAttribute('gps-entity-place', `latitude: ${latO}; longitude: ${lonO};`);
            document.getElementById(i).setAttribute('data-lat', `${latO}`);
            document.getElementById(i).setAttribute('data-lon', `${lonO}`);
            document.getElementById(i).setAttribute('data-next', `${i + 1}`);
        }
    }
    //Berechnung der Distanz zum Zielpunkt
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
    //"Navigation" -> Abarbeiten der Wegpunkte, über Distanzermittlung 
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
                ding.play();
            }
            else {
                one.remove();
                dong.play();
                one = next;
            }
        }
    }
    //Zieldistanz anzeigen 
    function Display() {
        const div = document.querySelector('#demo');
        div.innerText = "Distanz bis zum Ziel: " + dis.toFixed(2) + "m";
    }
    //Distanzberechnung zwischen den einzelnen Punkten 
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
        console.log(d);
        return d;
    }
}
