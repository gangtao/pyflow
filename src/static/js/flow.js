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

    panel.select(".panel-body").append("div").attr("id", "tree")

    $.get("/nodes", function(data) {
        //TODO : handler error
        /*
        $('#tree').jsonTree(data, {
            mandatorySelect: true,
            selectedIdElementName: 'tree',
            selectedItemId: 'tree'
        });

        d3.select('#tree').selectAll('li').attr('draggable', true);
        */
        treeview("tree", data);
    });
}

function renderCanvas() {
    var root = d3.select("#flowCanvas");
    var panel = addPanel(root, "Flow");
    panel.select(".panel-body").append("div").attr("id", "flow-panel").style("height", "300px").style("width", "100%");

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

        var uid = "testUID";
        var nodeSpec = {};
        nodeSpec.title = "testTitle";

        var node = addNode('flow-panel', uid, nodeSpec, { x: mx, y: my });
        instance.draggable($(node));

    }).on('dragover', function(ev) {
        //console.log("dragover");
        ev.preventDefault();
    });

    instance.doWhileSuspended(function() {
        instance.bind("connection", function(info, originalEvent) {});
    });

    jsPlumb.fire("jsFlowLoaded", instance);
}

function renderInspector() {
    var root = d3.select("#flowInspector");
    var panel = addPanel(root, "Inspector");
}


//UI Code to create node and port
function addNode(parentId, nodeId, nodeSpec, position) {
    var panel = d3.select("#" + parentId);

    //construct the node data copied from the nodeSpec
    var data = {};
    $.extend(data, nodeSpec, { nodeId: nodeId });

    panel.append('div').datum(data)
        .style('top', position.y)
        .style('left', position.x)
        .style('position', 'relative')
        .attr('align', 'center')
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
    //Assume horizental layout
    var number_of_ports = ports.length;
    var i = 0;
    var height = $(node).height(); //Note, jquery does not include border for height
    var y_offset = 1 / (number_of_ports + 1);
    var y = 0;

    for (; i < number_of_ports; i++) {
        var anchor = [0, 0, 0, 0];
        var labelAnchor = [-1.5, -0.3];
        var paintStyle = { radius: 5, fillStyle: '#FF8891', strokeStyle: '#225588' };
        var isSource = false,
            isTarget = false;
        if (type === 'output') {
            anchor[0] = 1;
            labelAnchor[0] = 1.8
            paintStyle.fillStyle = '#D4FFD6';
            paintStyle.strokeStyle = '#225588'
            isSource = true;
        } else {
            isTarget = true;
        }

        anchor[1] = y + y_offset;
        y = anchor[1];

        var endpoint = instance.addEndpoint(node, {
            uuid: node.getAttribute("id") + "-" + ports[i],
            paintStyle: paintStyle,
            anchor: anchor,
            maxConnections: -1,
            isSource: isSource,
            isTarget: isTarget
        });

        endpoint.setLabel({ location: labelAnchor, label: ports[i], cssClass: "endpointLabel" });

        //Show the port name only when mouse over to avoid noise
        //TODO : improve the Low efficiency to hide all endpoints
        d3.selectAll(".endpointLabel").style("visibility", "hidden");

        endpoint.bind("mouseover", function(source) {
            var label = source.getLabel();
            $(source.canvas).next().css("visibility", "visible");
        });

        endpoint.bind("mouseout", function(source) {
            d3.selectAll(".endpointLabel").style("visibility", "hidden");
        });
    }
}
