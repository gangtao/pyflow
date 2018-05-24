define(["model/flow", "util"], function(Flow, Util) {
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
            maxConnections: -1,
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

    var FLOW_PANEL_ID = "flow-panel";
    var instance = jsPlumb.getInstance({
        Connector: ["Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
        DragOptions: { cursor: "pointer", zIndex: 2000 },
        Container: FLOW_PANEL_ID
    });


    var Canvas = function Canvas(rootId, nodeSpec, nodeInspector) {
        this._rootId = rootId;
        this._nodeSpec = nodeSpec;
        this._instance = instance;
        this._inspector = nodeInspector;
        this._selectedNode = undefined;
        this._currentFlow = new Flow("pyflow.builder.gen", "SampleFlow");
        this._inspector.onNotify(this._update, this);
        this._panel = undefined;
    };

    Canvas.prototype.getNodeSpecById = function(id) {
        if (this._nodeSpec === undefined) {
            return undefined;
        }
        return this._nodeSpec[id];
    };

    Canvas.prototype.render = function() {
        var root = d3.select("#" + this._rootId);
        this._panel = Util.addPanel(root, "Flow");
        var me = this;

        var heading = root.select(".panel-heading");
        heading.append("br");

        heading.append("button").classed("glyphicon glyphicon-plus-sign flowbutton", true).on("click", function() {
            me._newflow();
        });

        heading.append("button").classed("glyphicon glyphicon-floppy-open flowbutton", true).on("click", function() {
            me._load();
        });

        heading.append("button").classed("glyphicon glyphicon-floppy-save flowbutton", true).on("click", function() {
            me._save();
        });

        heading.append("button").classed("glyphicon glyphicon-trash  flowbutton", true).on("click", function() {
            me._clear();
        });

        heading.append("button").classed("glyphicon glyphicon-search flowbutton", true).on("click", function() {
            me._showFlowSource();
        });

        heading.append("button").classed("glyphicon glyphicon-remove-circle flowbutton", true).on("click", function() {
            me._removeNode();
        }).style("visibility", "hidden");

        this._panel.select(".panel-body").classed("flowbody", true).append("div").attr("id", FLOW_PANEL_ID);

        //Add node on drag & drop
        $("#" + FLOW_PANEL_ID).on("drop", function(ev) {
            //avoid event conlict for jsPlumb
            if (ev.target.className.indexOf("_jsPlumb") >= 0) {
                return;
            }
            ev.preventDefault();

            var mx = "" + ev.originalEvent.offsetX + "px";
            var my = "" + ev.originalEvent.offsetY + "px";

            var nodeSpecId = ev.originalEvent.dataTransfer.getData("text");
            var nodeSpec = me.getNodeSpecById(nodeSpecId);
            if (nodeSpec === undefined) {
                return;
            }
            var uid = "node" + (new Date().getTime());

            //Update Flow Specification
            var node_def = {}
            node_def.id = uid;
            node_def.spec_id = nodeSpecId;
            node_def.name = nodeSpec.title;
            node_def.ports = []; // ports values
            node_def.ui = {};
            node_def.ui.x = mx;
            node_def.ui.y = my;

            me._currentFlow.addnode(node_def);
            me._drawNode(node_def);

        }).on("dragover", function(ev) {
            ev.preventDefault();
        });

        this._initInstance();

        //drawSampleFlow(instance);
        jsPlumb.fire("jsFlowLoaded", this._instance);
    };

    Canvas.prototype._initInstance = function() {
        var me = this;
        this._instance.bind("connection", function(info, originalEvent) {
            var sourceId = info.sourceId;
            var targetId = info.targetId;
            var sourcePort = info.sourceEndpoint.getLabel();
            var targetPort = info.targetEndpoint.getLabel();

            me._currentFlow.connect(sourceId, targetId, sourcePort, targetPort);
        });

        this._instance.bind("connectionDetached", function(info, originalEvent) {
            var sourceId = info.sourceId;
            var targetId = info.targetId;
            var sourcePort = info.sourceEndpoint.getLabel();
            var targetPort = info.targetEndpoint.getLabel();

            me._currentFlow.disconnect(sourceId, targetId, sourcePort, targetPort);
        });

        this._instance.bind("connectionMoved", function(info, originalEvent) {
            var osourceId = info.originalSourceId;
            var otargetId = info.originalTargetId;
            var osourcePort = info.originalSourceEndpoint.getLabel();
            var otargetPort = info.originalTargetEndpoint.getLabel();

            var nsourceId = info.newSourceId;
            var ntargetId = info.newTargetId;
            var nsourcePort = info.newSourceEndpoint.getLabel();
            var ntargetPort = info.newTargetEndpoint.getLabel();

            me._currentFlow.disconnect(osourceId, otargetId, osourcePort, otargetPort);
            me._currentFlow.connect(nsourceId, ntargetId, nsourcePort, ntargetPort);
        });
    }

    Canvas.prototype._drawSampleFlow = function() {
        //two sample nodes with one default connection
        var node1 = this._addNode(FLOW_PANEL_ID, "node1", { "title": "node1" }, { x: "80px", y: "120px" });
        var node2 = this._addNode(FLOW_PANEL_ID, "node2", { "title": "node2" }, { x: "380px", y: "120px" });

        this._addPorts(node1, ["out1", "out2"], "output");
        this._addPorts(node2, ["in", "in1", "in2"], "input");

        this._connectPorts(node1, "out2", node2, "in");
        this._connectPorts(node1, "out2", node2, "in1");

        this._instance.draggable($(node1));
        this._instance.draggable($(node2));
    };

    Canvas.prototype._drawNode = function(nodedef) {
        var nodeSpec = this.getNodeSpecById(nodedef.spec_id);
        if (nodeSpec === undefined) {
            console.log("Now such spec : " + nodedef.spec_id);
            return;
        }

        //TODO: handle the case where nodedef has no ui information.
        // DO auto layout, or put everything at 0.0
        var node = this._addNode(FLOW_PANEL_ID, nodedef.id, nodeSpec, { x: nodedef.ui.x, y: nodedef.ui.y });
        var i = 0,
            length = nodeSpec.port.input.length;
        var input_port_name = [];
        for (; i < length; i++) {
            input_port_name.push(nodeSpec.port.input[i].name);
            //TODO : sort by order
        }
        this._addPorts(node, input_port_name, "input");

        if (nodeSpec.port.output === undefined) {
            this._addPorts(node, ["out"], "output");
        } else {
            i = 0, length = nodeSpec.port.output.length;
            var output_port_name = [];
            for (; i < length; i++) {
                output_port_name.push(nodeSpec.port.output[i].name);
            }
            this._addPorts(node, output_port_name, "output");
        }

        this._instance.draggable($(node));
        return node;
    }

    //Flow UI control logic
    //UI Code to create node and port
    Canvas.prototype._addNode = function(parentId, nodeId, nodeSpec, position) {
        var me = this;
        var panel = d3.select("#" + parentId);
        //construct the node data copied from the nodeSpec
        var data = {};
        $.extend(data, nodeSpec, { nodeId: nodeId });

        panel.append("div").datum(data)
            .style("top", position.y)
            .style("left", position.x)
            .classed("pyflownode", true)
            .attr("id", function(d) {
                return d.nodeId;
            })
            .text(function(d) {
                return d.title;
            })
            .on("click", function(d) {
                me._inspector.showNodeDetails(d, me._currentFlow);
                me._selectedNode = d;
                d3.select(".glyphicon-remove-circle").style("visibility", "visible");
            })
            .on("mouseover", function(d) {
                //TODO : handling hover style here
                //d3.select(this).style("border", "3px #000 solid");
            })
            .on("mouseout", function(d) {
                //d3.select(this).style("border", "2px #000 solid");
            });

        return jsPlumb.getSelector("#" + nodeId)[0];
    };

    Canvas.prototype._addPorts = function(node, ports, type) {
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
            if (type === "output") {
                anchor[0] = 1;
                isSource = true;
            } else {
                isTarget = true;
            }

            anchor[1] = y + y_offset;
            y = anchor[1];

            var endpoint = undefined;

            if (isSource) {
                endpoint = this._instance.addEndpoint(node, sourceEndpoint, {
                    anchor: anchor,
                    uuid: node.getAttribute("id") + "-" + ports[i]
                });
            } else {
                endpoint = this._instance.addEndpoint(node, targetEndpoint, {
                    anchor: anchor,
                    uuid: node.getAttribute("id") + "-" + ports[i]
                });
            }

            var labelAnchor = [-1.5, -0.1];
            if (isSource) {
                labelAnchor = [1.5, -0.1];
            }
            endpoint.setLabel({ location: labelAnchor, label: ports[i], cssClass: "endpointLabel" });

            // Only show port lable on mouse over
            /*
            d3.selectAll(".endpointLabel").style("visibility", "hidden");
            endpoint.bind("mouseover", function(source) {
                var label = source.getLabel();
                $(source.canvas).next().css("visibility", "visible");
            });
            endpoint.bind("mouseout", function(source) {
                d3.selectAll(".endpointLabel").style("visibility", "hidden");
            });
            */
        }
    };

    Canvas.prototype._connectPorts = function(node1, port1, node2, port2) {
        var uuid_source = node1.getAttribute("id") + "-" + port1;
        var uuid_target = node2.getAttribute("id") + "-" + port2;
        this._instance.connect({ uuids: [uuid_source, uuid_target] });
    };

    // update the port values according to the run flow results
    Canvas.prototype._update = function() {
        var instance = this._instance;
        this._currentFlow._result.map(function(r){
            var node = $("#"+ r.id);   
            node.removeClass("node-fail"); 
            node.removeClass("node-skip"); 
                  
            if ( r.status == "fail" ) {
                node.addClass("node-fail");
            } 

            if ( r.status == "skip" ) {
                node.addClass("node-skip");
            } 

            r.inputs.map(function(input){
                var endpoint = instance.getEndpoint(r.id + "-" + input.name);
                endpoint.setLabel("" + input.value)
            })
            r.outputs.map(function(output){
                var endpoint = instance.getEndpoint(r.id + "-" + output.name);
                endpoint.setLabel("" + output.value)
            })
        })
    };

    Canvas.prototype._showFlowSource = function() {
        var modal_id = "flow_source_modal";
        var container_id = "flow_source_container";
        var showSourceModal = Util.getModal(modal_id, "Flow Description", function(modal) {
            var body = modal.select(".modal-body");
            body.attr("id", container_id).style("overflow", "auto");
        });

        $("#" + container_id).empty();
        d3.select("#" + container_id).append("pre").attr("id", "flow_source_text");
        var value = js_beautify(JSON.stringify(this._currentFlow.flow()));
        $("#flow_source_text").text(value);
        $("#" + modal_id).modal("show");
    };

    Canvas.prototype._clear = function() {
        this._instance.reset();
        $("#" + FLOW_PANEL_ID).empty();
        this._currentFlow.clear();
        this._initInstance();
    };

    Canvas.prototype._newflow = function () {
        var me = this;
        this._clear();

        var modal_id = "flow_new_modal";
        var flowNewModal = Util.getModal(modal_id, "New Flow", function(modal) {
            var body = modal.select(".modal-body");
            body.style("overflow", "auto");
            var form = body.append("form");
            var group1 = form.append("div").classed("form-group", true);
            group1.append("label").attr("for", "flowid").text("Flow ID");
            group1.append("a").attr("href", "#").attr("id", "flowid").text("sampleId");

            var group2 = form.append("div").classed("form-group", true);
            group2.append("label").attr("for", "flowname").text("Flow Name");
            group2.append("a").attr("href", "#").attr("id", "flowname").text("sampleName");

            var footer = modal.select(".modal-footer");
            footer.append("button").attr("type", "button").classed("btn btn-default", true).attr("id", "new_flow_btn").text("New");

            $("#flowid").text("xxx.xxx.xxx").editable();
            $("#flowname").text("untitled").editable();
        });

        $("#new_flow_btn").click(function() {
            $("#flow_new_modal").modal("hide");
            me._currentFlow = new Flow($("#flowid").text(), $("#flowname").text());
        });
        $("#flow_new_modal").modal("show");
    };

    Canvas.prototype._save = function() {
        this._currentFlow.save();
    };

    Canvas.prototype._load = function() {
        var me = this;
        //load existing flows
        $.get("/flows", function(data) {
            //console.log(data);
            var modal_id = "flow_load_modal";
            var container_id = "flow_load_container";
            var flowLoadModal = Util.getModal(modal_id, "Load Flow", function(modal) {
                var body = modal.select(".modal-body");
                body.attr("id", container_id).style("overflow", "auto");
            });

            $("#" + container_id).empty();
            var flowItems = d3.select("#" + container_id).append("ul").selectAll("li").data(data).enter().append("li").append("a").text(function(d) {
                return d.id + ":" + d.name;
            }).on("click", function(d) {
                $("#" + modal_id).modal("hide");
                me._loadflow(d);
            });

            $("#" + modal_id).modal("show");
        });
    };

    Canvas.prototype._loadflow = function(flow) {
        var me = this;
        this._clear();
        this._currentFlow = new Flow(flow.id, flow.name);

        flow.nodes.map(function(node) {
            me._currentFlow.addnode(node);
            var anode = me._drawNode(node);
        });

        flow.links.map(function(link) {
            source = link.source.split(":");
            target = link.target.split(":");
            me._currentFlow.connect(source[0], target[0], source[1], target[1]);
            me._connectPorts($("#" + [source[0]])[0], source[1], $("#" + [target[0]])[0], target[1]);
        });
    };

    Canvas.prototype._removeNode = function(){
        this._instance.remove(this._selectedNode.nodeId);
        d3.select(".glyphicon-remove-circle").style("visibility", "hidden");
        //TODO : remove the node and links from current flow
        this._currentFlow.removenode(this._selectedNode);
        //TODO : clear the inspector as well
    };

    return Canvas;
});