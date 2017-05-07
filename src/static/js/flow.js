define(["treeview", "util"], function(TreeView, Util) {
    var Flow = {};

    //Global Paint Styles
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
            connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
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
            ]
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
            ]
        };

    var FLOW_PANEL_ID = 'flow-panel';

    // -------------------------------------
    //Global Variables
    var nodeTreeSpecification = undefined;
    var currentFlow = {
        "id": "pyflow.builder.gen",
        "name": "SampleFlow",
        "nodes": [],
        "links": []
    };
    var connectionList = [];

    function getNodeSpecById(id) {
        if (nodeTreeSpecification === undefined) {
            return undefined;
        }
        return nodeTreeSpecification[id];
    }

    // -------------------------------------


    // -------------------------------------
    // Main UI Logic
    Flow.render = function() {
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
        var panel = Util.addPanel(root, "Nodes");

        panel.select(".panel-body").append("div").attr("id", "tree");

        $.get("/nodes", function(data) {
            var tree = _list2tree(data);
            console.log(tree);
            nodeTreeSpecification = data;
            TreeView.rendor("tree", tree);
        });
    }

    function _list2tree(nodes) {
        var tree = [{
            "title": "pyflow",
            "id": "pyflow",
            "children": []
        }];

        for (var node in nodes) {
            _insertNode(tree[0], nodes[node]);
        }

        return tree;
    }

    function _insertNode(node, item) {
        if (item === undefined) {
            return;
        }
        var id = item.id;
        var ids = id.split(".");

        var i = 0,
            length = ids.length;
        var checkId = ids[0];

        for (; i < length; i++) {
            if (checkId === node.id) {
                if (i === length - 1) { //Is last Layer /Leaf
                    node.content = item; //override duplicated node, should never run into this now
                    return;

                } else if (i === length - 2) {
                    if (node.children === undefined) {
                        node.children = [];
                    }
                    var newChild = {};
                    newChild.id = checkId + "." + ids[i + 1];
                    newChild.title = ids[i + 1];
                    newChild.content = item;
                    node.children.push(newChild);
                    return;

                } else {
                    if (node.children === undefined) {
                        node.children = [];
                    }
                    var newChild = {};
                    newChild.id = checkId + "." + ids[i + 1];
                    newChild.title = ids[i + 1];
                    _appendChild(node, newChild);
                    node.children.forEach(function(entry) {
                        _insertNode(entry, item);
                    })
                }
            }
            checkId = checkId + "." + ids[i + 1];
        }

    }

    function _appendChild(tree, child) {
        var i = 0,
            length = tree.children.length;
        for (; i < length; i++) {
            if (tree.children[i].id === child.id) {
                return;
            }
        }
        tree.children.push(child);
    }

    function renderCanvas() {
        var root = d3.select("#flowCanvas");
        var panel = Util.addPanel(root, "Flow");
        panel.select(".panel-body").style("height", "300px").append("div").attr("id", FLOW_PANEL_ID).style("position", "absolute").style("height", "300px").style("width", "100%");
        //Initialize JsPlumb
        instance = jsPlumb.getInstance({
            Connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
            DragOptions: { cursor: "pointer", zIndex: 2000 },
            Container: FLOW_PANEL_ID
        });
        //Add node on drag & drop
        $('#' + FLOW_PANEL_ID).on('drop', function(ev) {
            console.log("A drop happened!");
            //avoid event conlict for jsPlumb
            if (ev.target.className.indexOf('_jsPlumb') >= 0) {
                return;
            }

            ev.preventDefault();

            var mx = '' + ev.originalEvent.offsetX + 'px';
            var my = '' + ev.originalEvent.offsetY + 'px';

            var nodeSpecId = ev.originalEvent.dataTransfer.getData('text');
            var nodeSpec = getNodeSpecById(nodeSpecId);
            if (nodeSpec === undefined) {
                return;
            }
            var uid = 'node' + (new Date().getTime());
            //Update Flow Specification
            var node_def = {}
            node_def.id = uid;
            node_def.spec_id = nodeSpecId;
            node_def.name = nodeSpec.title;
            node_def.ports = [];
            node_def.ui = {};
            node_def.ui.x = mx;
            node_def.ui.y = my;
            currentFlow.nodes.push(node_def);

            var node = addNode(FLOW_PANEL_ID, uid, nodeSpec, { x: mx, y: my });
            var i = 0,
                length = nodeSpec.port.input.length;
            var input_port_name = [];
            for (; i < length; i++) {
                input_port_name.push(nodeSpec.port.input[i].name);
                //TODO : sort by order
            }
            addPorts(instance, node, input_port_name, 'input');

            if (nodeSpec.port.output === undefined) {
                addPorts(instance, node, ['out'], 'output');
            } else {
                i = 0, length = nodeSpec.port.output.length;
                var output_port_name = [];
                for (; i < length; i++) {
                    output_port_name.push(nodeSpec.port.output[i].name);
                }
                addPorts(instance, node, output_port_name, 'output');
            }

            instance.draggable($(node));

        }).on('dragover', function(ev) {
            //console.log("dragover");
            ev.preventDefault();
        });
        instance.batch(function() {
            instance.bind("connection", function(info, originalEvent) {});
            drawSampleFlow(instance);
        });

        jsPlumb.fire("jsFlowLoaded", instance);
    }

    function drawSampleFlow(instance) {
        //two sample nodes with one default connection
        var node1 = addNode(FLOW_PANEL_ID, 'node1', { "title": "node1" }, { x: '80px', y: '120px' });
        var node2 = addNode(FLOW_PANEL_ID, 'node2', { "title": "node2" }, { x: '380px', y: '120px' });

        addPorts(instance, node1, ['out1', 'out2'], 'output');
        addPorts(instance, node2, ['in', 'in1', 'in2'], 'input');

        connectPorts(instance, node1, 'out2', node2, 'in');

        instance.draggable($(node1));
        instance.draggable($(node2));
    }

    function renderInspector() {
        var root = d3.select("#flowInspector");
        var panel = Util.addPanel(root, "Inspector");
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
        //Assume horizental layout
        var number_of_ports = ports.length;
        var i = 0;
        var height = $(node).height(); //Note, jquery does not include border for height
        var y_offset = 1 / (number_of_ports + 1);
        var y = 0;

        for (; i < number_of_ports; i++) {
            var anchor = [0, 0, 0, 0];
            var isSource = false,
                isTarget = false;
            if (type === 'output') {
                anchor[0] = 1;
                isSource = true;
            } else {
                isTarget = true;
            }

            anchor[1] = y + y_offset;
            y = anchor[1];

            if (isSource) {
                instance.addEndpoint(node, sourceEndpoint, {
                    anchor: anchor,
                    uuid: node.getAttribute("id") + "-" + ports[i]
                });
            } else {
                instance.addEndpoint(node, targetEndpoint, {
                    anchor: anchor,
                    uuid: node.getAttribute("id") + "-" + ports[i]
                });
            }
        }
    }

    function connectPorts(instance, node1, port1, node2, port2) {

        var uuid_source = node1.getAttribute("id") + "-" + port1;
        var uuid_target = node2.getAttribute("id") + "-" + port2;

        instance.connect({ uuids: [uuid_source, uuid_target] });
    }

    return Flow;

});
