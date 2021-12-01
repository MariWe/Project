/**
 * Reads the buildings graph data and puts them into an object
 * @param {string} GRAPH_PATH Path to the building's graph data.json
 */

function readGraphData(GRAPH_PATH = "./complete.json"){

    const promise = new Promise(function (resolve, reject) {
        try {
            let xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open('GET', GRAPH_PATH, true);
            xobj.setRequestHeader('Cache-Control', 'no-cache');
            xobj.responseType = 'blob';
            xobj.onload = function () {
                if (this.status === 200) {
                    let graphFile = new File([this.response], 'temp');
                    let fileReader = new FileReader();
                    fileReader.addEventListener('load', function () {
                        resolve(JSON.parse(fileReader.result));
                    });
                    fileReader.readAsText(graphFile);
                }
            };
            xobj.send();
        }
        catch (error) {
            reject(error);
        }
    });
    return promise;
}

/**
 * Creates animation curve from control points
 * @param {number} from Startpoint
 * @param {number} to Endpoint
 * @param {boolean} doTranslation Flag for forcing translation of coordinates
 */
function create_animation_curve(to = 24, from = -1, doTranslation = true) {

    // use routing algorithm
    let algo = new RoutingAlgorithm(readGraphData());
    let fromParse = algo.GetNodeLabelByID(from);
    let toParse = algo.GetNodeLabelByID(to);
    let control_points = algo.GetDijkstraSolution(fromParse, toParse, 0.0);

    // bring control_points into needed format
    doTranslation = !!doTranslation;
    if(doTranslation)
        control_points = control_points.map(function(point){
            point[0] += 0;
            point[1] += 0;
            point[2] = 43.62 - point[2];
            return point;
        });

    // create three.js curve
    curve = new THREE.CatmullRomCurve3(
        control_points.map((p, ndx) => {
            let p0 = new THREE.Vector3();
            let p1 = new THREE.Vector3();

            p0.set(...p);
            p1.set(...control_points[(ndx + 1) % control_points.length]);
            let ret;
            if ((ndx < control_points.length - 1) &&
                (p0.y !== p1.y)) {
                ret = [
                    (new THREE.Vector3()).copy(p0),
                    (new THREE.Vector3()).lerpVectors(p0, p1, 0.2),
                    (new THREE.Vector3()).lerpVectors(p0, p1, 0.4),
                    (new THREE.Vector3()).lerpVectors(p0, p1, 0.6),
                    (new THREE.Vector3()).lerpVectors(p0, p1, 0.8),
                ];
            } else {
                ret = [(new THREE.Vector3()).copy(p0)];
            }
            return ret;
        }).flat(),
        false
    );

    const points = curve.getPoints(1000); // get 1000 points from curve
    console.log(points);
}

