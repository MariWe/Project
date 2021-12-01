let m = [];
let n = [];
let points;
let lat, lon;
let R = 6378137;

window.onload = function () {

    readGraphData().then(function (text) {
        let algo = new RoutingAlgorithm(text);
        points = algo.GetDijkstraSolution("E", "P_024", 0.0);
        return points;
    }).then(function (points) {
        Position();
        createPoints();
    }).then(function (position) {
        setTimeout(function () {
            GPSrechner();
            one = document.getElementById(0);
            Pointing();
        }, 2000)   
    }).catch(function (error) {
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

    function Position() {
        navigator.geolocation.getCurrentPosition(function (position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
        }
        )}

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

            console.log(latO, lonO);
        }
    }
}
