class RoutingAlgorithm{
    constructor(graphData){
        const graph = JSON.parse(JSON.stringify(graphData));
        const nodes = graph.features.filter(item => item.properties.type === "node");
        const edges = graph.features.filter( item => item.properties.type === "edge");

        this.GetDijkstraSolution = function (labelA, labelB, trajectoryRadius = 0){

            //Initialisierung der Gesamtkosten der Knoten
            const dijkstraNodes = nodes.map(item =>{
                item.properties.TotalDistance = Number.POSITIVE_INFINITY;
                item.properties.Previous = undefined;
                return item;
            });

            //Warteschlange der zu besuchendemKnoten
            const queue = [];

            //Liste der schon besuchten Knoten
            const visited =[];

            //Hilfsfunktion zum Ermitteln des Knotens in Warteschlange mit geringster Gesamtkosten
            const FindMinNodeInQueue = function() {
                let min = nodes[queue[0]].properties.TotalDistance;
                let pos = 0;

                for (let i = 1, len = queue.length; i < len; i++) {
                    let totalDistance = nodes[queue[i]].properties.TotalDistance;
                    if(totalDistance < min){
                        min = totalDistance;
                        pos = i;
                    }
                }
                return {Value: queue[pos], Index: pos};
            };
            //Hilfsfunktion zum Ermitteln benachbarter Knoten
            const FindNeighborEdges = function (node){
                return edges.filter(edge => {
                    let match = false;
                    if(edge.properties.nodes.start === node.properties.label) {
                        match = true;
                    }
                    if(!match && edge.properties.bidirectional && edge.properties.nodes.end === node.properties.label) {
                        match = true;
                    }
                    return match;
                });
            };

            //Hilfsfunktion zum Berechen der Gesamtkosten vom Start- zum zu prüfendemKnoten
            const CalculateTotalDistance  = function (node, edge){
                const p1 = edge.geometry.coordinates[0];
                const p2 = edge.geometry.coordinates[1];
                return node.properties.TotalDistance + Math.sqrt( Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[2]- p1[2], 2));
            };

            //Intialisierung des Startknotens
            const startIndex = dijkstraNodes.map( node => node.properties.label).indexOf(labelA);
            dijkstraNodes[startIndex].properties.TotalDistance = 0;
            dijkstraNodes[startIndex].properties.Previous = null;

            //Hinzufügen des Startknoten zur Prüf-Warteschlange
            queue.push(startIndex);

            //Dijkstra-Ergebnis liegt vor wenn Prüf-Warteschlange leer ist
            while(queue.length > 0){
                let minNode = FindMinNodeInQueue();
                let node = dijkstraNodes[minNode.Value];
                let neighborEdges = FindNeighborEdges(node);
                for(let i = 0, len = neighborEdges.length; i < len; i++)
                {
                    let edge = neighborEdges[i];
                    let destNodeLabel;

                    // Ermittlung des Zielknotens der Kante
                    if(edge.properties.nodes.start === node.properties.label){
                        destNodeLabel = edge.properties.nodes.end;
                    }
                    else{
                        destNodeLabel = edge.properties.nodes.start;
                    }
                    //Zielknoten auf Besucht-Status prüfen und ggf Bearbeitung überspringen
                    if(visited.map(visitIndex => dijkstraNodes[visitIndex].properties.label).indexOf(destNodeLabel) !== -1)
                    {
                        continue;
                    }

                    //Berechnung der Gesamtkosten zum Nachbar
                    let totalDistance = CalculateTotalDistance(node, edge);
                    let destNodeIndex = dijkstraNodes.map(node => node.properties.label).indexOf(destNodeLabel);

                    //Aktualsierung der Gesamtkosten des Nachbars, wenn neue Gesamtkosten niedriger
                    if(dijkstraNodes[destNodeIndex].properties.TotalDistance > totalDistance){
                        dijkstraNodes[destNodeIndex].properties.TotalDistance = totalDistance;
                        dijkstraNodes[destNodeIndex].properties.Previous = node.properties.label;
                    }
                    //Nachbar der Prüf-Warteschlange hinzufügen
                    if(queue.indexOf(destNodeIndex) === -1){
                        queue.push(destNodeIndex);
                    }
                }

                //Betrachteten Knoten aus der Prüf-Warteschlange entfernen und der Besucht-Liste hinzufügen
                queue.splice(minNode.Index, 1);
                visited.push(minNode.Value);
            }
            const solutionData = visited.map(nodeIndex => {
                return dijkstraNodes[nodeIndex];
            });
            let endNode = solutionData.filter(node => node.properties.label === labelB)[0];
            let result = [];
            if(endNode !== undefined) {
                const destNode = endNode;
                let solution = [labelB, destNode.properties.Previous];
                while (endNode.properties.Previous !== null) {
                    endNode = dijkstraNodes.filter(node => node.properties.label === endNode.properties.Previous)[0];
                    solution.push(endNode.properties.Previous);
                }
                solution = solution.filter(item => item !== null).reverse().map(step => {
                    let nodeIndex = dijkstraNodes.map(node => node.properties.label).indexOf(step);
                    let node = dijkstraNodes[nodeIndex];
                    return node.geometry.coordinates;
                });
                result = solution;
            }
            result = result.map(function(e){
                let n = e[1];
                e[1] = e[2];
                e[2] = n;
                return e;
            });

            return result;
        };

        this.GetNextNodeLabel = function (solution, percentage){
            percentage = Math.max(0,Math.min(1,percentage));
            let nextIndex = Math.min(solution.path.length - 1 , Math.ceil(solution.path.length * percentage ));
            if(nextIndex === 0){
                nextIndex++;
            }
            if(nextIndex >= solution.path.length){
                nextIndex -= nextIndex - solution.path.length + 1;
            }
            const nextNodeCoordinateString = JSON.stringify(solution.path[nextIndex]);
            const nextNode = nodes.filter(node => JSON.stringify(node.geometry.coordinates) === nextNodeCoordinateString)[0];
            return nextNode.properties.label;
        };

        // Wandelt ids in label um
        this.GetNodeLabelByID = function (id){
            let result;
            switch (id)
            {
                case -1:
                    result = "E";
                    break;
                case -2:
                    result = "A";
                    break;
                default:
                    const level = Math.floor(id /100);
                    id = ("0" + id % 100).slice(-2);
                    result = `P_${level}${id}`;
            }
            return result;
        };
    }
}