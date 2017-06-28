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
        var inspector = this;

        var table = this._body.append("table").classed("table table-bordered table-condensed", true);
        var tbody = table.append("tbody");

        var row_id = tbody.append("tr");
        row_id.append("th").text("ID");
        row_id.append("td").text(node.nodeId);

        var row_spec_id = tbody.append("tr");
        row_spec_id.append("th").text("Specification ID");
        row_spec_id.append("td").text(node.id);

        var row_spec_title = tbody.append("tr");
        row_spec_title.append("th").text("Title");
        row_spec_title.append("td").text(node.title);

        //Input Ports
        var i = 0,
            length = node.port.input.length;
        for (; i < length; i++) {
            var portName = node.port.input[i].name;
            var row_input_port = tbody.append("tr");
            row_input_port.append("th").text("In Port : " + portName);
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
                    var value = source_port_value;
                    soruce_port_result_cell.append("pre").style("margin", "0px").text("Value : \n" + value);
                }

            } else {
                var port_input = row_input_port.append("td").append("input").datum(data)
                    .on("change", function(d) {
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

            row_output_port.append("th").text("Out Port : " + portName);

            var targetPort = flow.findTargetPort(node.nodeId, portName);

            var out_result_cell = row_output_port.append("td").style("max-width", "200px").append("div");
            if (targetPort) {
                out_result_cell.append("p").style("margin", "0px").text("To:" + targetPort.id + ":" + targetPort.port);
            }

            if (result !== undefined) {
                out_result_cell.append("br").style("margin", "0px");

                var value = result;
                out_result_cell.append("pre").style("margin", "0px").text("Value : \n" + value);
            }
        }

        var row_flow_status = tbody.append("tr");
        row_flow_status.append("th").text("Status");
        row_flow_status.append("td").text(flow.status(node.nodeId));

        var row_flow_error = tbody.append("tr");
        row_flow_error.append("th").text("Error");
        row_flow_error.append("td").text(flow.error(node.nodeId));


        var row_action = tbody.append("tr");
        row_action.append("th").text("Action");
        var action_content = row_action.append("td");
        action_content.append("button").datum({ id: node.nodeId }).text("Run").classed("btn btn-xs btn-primary", true)
            .on("click", function(d) { 
                var progressBar = action_content.append('img').attr("src", "img/animated-progress.gif")
                    .attr("height", "30").attr("width", "30");
                function handleFlowRunResult(data) {
                    inspector.showNodeDetails(node, flow);
                }

                flow.setEndNode(d.id);
                flow.run(handleFlowRunResult);
            });
    };

    return Inspector;
});
