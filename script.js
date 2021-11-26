let m = [];

window.onload = function () {
    
    CreatePoints();
    function CreatePoints() {
        for (i = 1; i < 200; i++) {
            m[i] = document.createElement('a-sphere');
            document.querySelector('a-scene').appendChild(m[i]);
            m[i].setAttribute('radius', '1');
            m[i].setAttribute('color', 'blue');
            m[i].setAttribute('scale', '0.05 0.05 0.05');
            m[i].setAttribute('position', { x: i / 10, y: 0, z: 0 });

        }
    }
}
