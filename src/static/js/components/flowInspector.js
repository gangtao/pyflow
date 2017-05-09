define(["util"], function(Util) {
    var Inspector = function(rootId) {
        this._rootId = rootId;
    };

    Inspector.prototype.render = function() {
        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "Inspector");
        this._body = panel.select(".panel-body").attr("id", "InspectorBody");
    }

    Inspector.prototype.showNodeDetails = function(node, flow) {
        $("#InspectorBody").empty();

        var table = this._body.append("table").classed("table table-bordered", true);
        var tbody = table.append("tbody");

        var row_id = tbody.append("tr");
        row_id.append("td").text("ID");
        row_id.append("td").text(node.nodeId);

        var row_spec_id = tbody.append("tr");
        row_spec_id.append("td").text("Specification ID");
        row_spec_id.append("td").text(node.id);

        var row_spec_title = tbody.append("tr");
        row_spec_title.append("td").text("Title");
        row_spec_title.append("td").text(node.title);

        //Input Ports
        var i = 0,
            length = node.port.input.length;
        for (; i < length; i++) {
            var portName = node.port.input[i].name;
            var row_input_port = tbody.append("tr");
            row_input_port.append("td").text("In Port : " + portName);
            var data = {};
            data.id = node.nodeId;
            data.port = portName;

            var sourcePort = flow.findSourcePort(node.nodeId, portName);

            if (sourcePort) {
                var source_port_value = flow.getRunResult(sourcePort.id, sourcePort.port);
                var soruce_port_result_cell = row_input_port.append("td").append("div");

                soruce_port_result_cell.append("p").style("margin", "0px").text("From:" + sourcePort.id + ":" + sourcePort.port);

                if (source_port_value !== undefined) {
                    soruce_port_result_cell.append("br").style("margin", "0px");
                    var value = js_beautify(source_port_value);
                    soruce_port_result_cell.append("pre").style("margin", "0px").text("Value : \n" + value);
                }

                //row_input_port.append("td").text("From:"+ sourcePort.id + ":" + sourcePort.port); 
            } else {
                var port_input = row_input_port.append("td").append("input").datum(data)
                    .on("change", function(d) {
                        //console.log("Port edited! " + d.id + ":" + d.port);
                        flow.setPortValue(d.id, d.port, d3.select(this).property("value"));
                    });

                //TODO: get node Spec
                var port_value = flow.getPortValue(data.id, data.port, undefined);
                if (port_value) {
                    port_input.property("value", port_value);
                }
            }
        }

        //Output Ports
        i = 0, length = node.port.output.length;
        for (; i < length; i++) {
            var portName = node.port.output[i].name;
            var result = flow.getRunResult(node.nodeId, portName);
            var row_output_port = tbody.append("tr");

            row_output_port.append("td").text("Out Port : " + portName);

            var targetPort = flow.findTargetPort(node.nodeId, portName);

            var out_result_cell = row_output_port.append("td").style("max-width", "200px").append("div");
            if (targetPort) {
                out_result_cell.append("p").style("margin", "0px").text("To:" + targetPort.id + ":" + targetPort.port);
            }

            if (result !== undefined) {
                out_result_cell.append("br").style("margin", "0px");
                var value = js_beautify(result);
                out_result_cell.append("pre").style("margin", "0px").text("Value : \n" + value);
            }
        }

        var row_action = tbody.append("tr");
        row_action.append("td").text("Action");
        var action_content = row_action.append("td");
        action_content.append("button").datum({ id: node.nodeId }).text("Run").classed("btn btn-xs btn-primary", true)
            .on("click", function(d) {
                
                flow.setEndNode(d.id);
                flow.run();
                
                /*
                var progressBar = action_content.append('img').attr("src", "/dj/static/TAFlowBuilder/img/animated-progress.gif")
                    .attr("height", "30").attr("width", "30");
                
                //Add Progress Bar here
                $.post("../flow/", { "data": flowSpecString }, function(d) {
                    console.log("Post flow success! " + d);
                    lastResult = JSON.parse(d);
                    showNodeDetails(node);
                });
                */

            });
    };

    return Inspector;
});
