function renderFlow() {
    $("#mainUI").empty();

    var rootUI = d3.select("#mainUI").append("div").classed("row", true);
    var nodeTree = rootUI.append("div").classed("col-md-3", true).attr("id", "flowTree");

    var flowUI = rootUI.append("div").classed("col-md-8", true).attr("id", "flowUI");
    var flowCanvas = flowUI.append("div").classed("row", true).attr("id", "flowCanvas");
    var flowInspector = flowUI.append("div").classed("row", true).attr("id", "flowInspector");

    renderTree();
    renderCanvas();
    renderInspector();
}

function renderTree() {
    var root = d3.select("#flowTree");
    var panel = addPanel(root, "Nodes");

    panel.select(".panel-body").append("div").attr("id", "tree");

    $.get("/nodes", function(data) {
        treeview("tree", data);
    });
}

function renderCanvas() {
    var root = d3.select("#flowCanvas");
    var panel = addPanel(root, "Flow");
    panel.select(".panel-body").style("height", "300px").append("div").attr("id", "flow-panel").style("position", "absolute").style("height", "300px").style("width", "100%");

    //Initialize JsPlumb
    var color = "#62c462";
    instance = jsPlumb.getInstance({
        // notice the 'curviness' argument to this Bezier curve.  the curves on this page are far smoother
        // than the curves on the first demo, which use the default curviness value.      
        Connector: ["Bezier", { curviness: 50 }],
        DragOptions: { cursor: "pointer", zIndex: 2000 },
        PaintStyle: {
            strokeStyle: color,
            lineWidth: 2,
            outlineStroke: "black",
            outlineWidth: 1
        },
        Endpoint: ["Dot", { radius: 5 }],
        EndpointStyle: { fillStyle: color },
        HoverPaintStyle: { strokeStyle: "#7073EB" },
        EndpointHoverStyle: { fillStyle: "#7073EB" },
        Container: "flow-panel"
    });

    //Add node on drag & drop
    $('#flow-panel').on('drop', function(ev) {
        console.log("A drop happened!");
        //avoid event conlict for jsPlumb
        if (ev.target.className.indexOf('_jsPlumb') >= 0) {
            return;
        }

        ev.preventDefault();

        var mx = '' + ev.originalEvent.offsetX + 'px';
        var my = '' + ev.originalEvent.offsetY + 'px';

        var uid = "nodeid_" + new Date().getTime();
        var nodeSpec = {};
        nodeSpec.title = "testTitle";

        var node = addNode('flow-panel', uid, nodeSpec, { x: mx, y: my });
        instance.draggable($(node));

    }).on('dragover', function(ev) {
        //console.log("dragover");
        ev.preventDefault();
    });

    instance.batch(function() {
        //instance.bind("connection", function(info, originalEvent) {});

        // declare some common values:
        var arrowCommon = { foldback: 0.8, fillStyle: color, width: 5 },
            // use three-arg spec to create two different arrows with the common values:
            overlays = [
                ["Arrow", { location: 0.8 }, arrowCommon],
                ["Arrow", { location: 0.2, direction: -1 }, arrowCommon]
            ];

        var connectorPaintStyle = {
                strokeWidth: 2,
                stroke: "#61B7CF",
                joinstyle: "round",
                outlineStroke: "white",
                outlineWidth: 2
            },
            connectorHoverStyle = {
                strokeWidth: 3,
                stroke: "#216477",
                outlineWidth: 5,
                outlineStroke: "white"
            },
            endpointHoverStyle = {
                fill: "#216477",
                stroke: "#216477"
            },
            sourceEndpoint = {
                endpoint: "Dot",
                paintStyle: {
                    stroke: "#7AB02C",
                    fill: "transparent",
                    radius: 7,
                    strokeWidth: 1
                },
                isSource: true,
                connector: ["Bezier", { curviness: 160 }],
                connectorStyle: connectorPaintStyle,
                hoverPaintStyle: endpointHoverStyle,
                connectorHoverStyle: connectorHoverStyle,
                dragOptions: {},
                overlays: [
                    ["Label", {
                        location: [0.5, 1.5],
                        label: "Drag",
                        cssClass: "endpointSourceLabel",
                        visible: false
                    }]
                ],
                Container: "flow-panel"
            },
            // the definition of target endpoints (will appear when the user drags a connection)
            targetEndpoint = {
                endpoint: "Dot",
                paintStyle: { fill: "#7AB02C", radius: 7 },
                hoverPaintStyle: endpointHoverStyle,
                maxConnections: -1,
                dropOptions: { hoverClass: "hover", activeClass: "active" },
                isTarget: true,
                overlays: [
                    ["Label", { location: [0.5, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible: false }]
                ],
                Container: "flow-panel"
            };

        var node1 = addNode('flow-panel', 'node1', { "title": "node1" }, { x: '80px', y: '120px' });
        var node2 = addNode('flow-panel', 'node2', { "title": "node2" }, { x: '280px', y: '120px' });


        instance.addEndpoint(node1, sourceEndpoint, {
            anchor: ["TopLeft"],
            uuid: "testUUid"
        });

        //addPorts(instance, node1, ['out1', 'out2'], 'output');
        //addPorts(instance, node2, ['in', 'in1', 'in2'], 'input');

        //connectPorts(instance, node1, 'out2', node2, 'in');

        instance.draggable($(node1));
        instance.draggable($(node2));
    });

    jsPlumb.fire("jsFlowLoaded", instance);
}

function renderInspector() {
    var root = d3.select("#flowInspector");
    var panel = addPanel(root, "Inspector");
}


//Flow UI control logic
//UI Code to create node and port
function addNode(parentId, nodeId, nodeSpec, position) {
    var panel = d3.select("#" + parentId);

    //construct the node data copied from the nodeSpec
    var data = {};
    $.extend(data, nodeSpec, { nodeId: nodeId });

    panel.append('div').datum(data)
        .style('top', position.y)
        .style('left', position.x)
        .classed('node', true)
        .attr('id', function(d) {
            return d.nodeId;
        })
        .text(function(d) {
            return d.title;
        })
        .on('click', function(d) {
            //console.log(d3.select(this).text() + ' selected');
            //showNodeDetails(d);
        })
        .on('mouseover', function(d) {
            d3.select(this).style('border', '3px #000 solid');
        })
        .on('mouseout', function(d) {
            d3.select(this).style('border', '2px #000 solid');
        });

    return jsPlumb.getSelector('#' + nodeId)[0];
}

function addPorts(instance, node, ports, type) {
    var number_of_ports = ports.length;

    var paintStyle = { radius: 5, fillStyle: '#FF8891' };
    var anchor = [0, 0, 0, 0];
    var i = 0;

    for (; i < number_of_ports; i++) {
        instance.addEndpoint(node, {
            endpoint: "Dot",
            anchor: "AutoDefault"
        });
    }
}


function connectPorts(instance, node1, port1, node2, port2) {
    // declare some common values:
    var color = "gray";
    var arrowCommon = { foldback: 0.8, fillStyle: color, width: 5 },
        // use three-arg spec to create two different arrows with the common values:
        overlays = [
            ["Arrow", { location: 0.8 }, arrowCommon],
            ["Arrow", { location: 0.2, direction: -1 }, arrowCommon]
        ];

    var uuid_source = node1.getAttribute("id") + "-" + port1;
    var uuid_target = node2.getAttribute("id") + "-" + port2;

    instance.connect({ uuids: [uuid_source, uuid_target] });
}
