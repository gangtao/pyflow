define(["util", "model/flow"], function(Util, Flow) {
    var Panel = function(rootId, propertyPanel) {
        this._rootId = rootId;
        this._editor = undefined;
        this._propertyPanel = propertyPanel;
        this._currentNode = undefined;
        this._titleSpan = undefined;
    };

    Panel.prototype.connectListPanel = function(listPanel) {
        this._listPanel = listPanel;
    };

    Panel.prototype.render = function() {
        $("#" + this._rootId).empty();
        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "Node Code");
        var me = this;
        this._body = panel.select(".panel-body").attr("id", "NodeCodeBody");
        this._body.append("textarea").classed("form-control", true).attr("id", "NodeCodeEditor");

        var heading = root.select(".panel-heading");
        this._titleSpan = heading.append("span").classed("label label-primary", true).style("margin-left", "5px");
        heading.append("br");

        heading.append("button").classed("glyphicon glyphicon-plus-sign flowbutton", true).on("click", function() {
            me._listPanel.addNode();
        });

        heading.append("button").classed("glyphicon glyphicon-floppy-save flowbutton", true).on("click", function() {
            me._save();
        });

        heading.append("button").classed("glyphicon glyphicon-trash  flowbutton", true).on("click", function() {
            me._listPanel.deleteNode(me._currentNode);
        });

        heading.append("button").classed("glyphicon glyphicon-glass  flowbutton", true).on("click", function() {
            me._test();
        });

        this._editor = CodeMirror.fromTextArea(document.getElementById("NodeCodeEditor"), {
            lineNumbers: true,
            indentUnit: 4,
            mode: "python",
            theme: "icecoder"
        });

        this._editor.on("change", function(cm, change) {
            var code = cm.getValue();
            me._validate(code);
        });
    };

    Panel.prototype.text = function(data) {
        if (data == undefined) {
            return this._editor.getValue();
        }
        this._editor.setValue(data);
    };

    Panel.prototype.update = function(node) {
        this._currentNode = node;
        this._titleSpan.text(node.id() + " : " + node.title());
        this.text(node.func());
    };

    Panel.prototype._save = function() {
        this._currentNode.func(this._editor.getValue());
        this._currentNode.save();
    };

    Panel.prototype._validate = function(code) {
        var lines = code.trim().split("\n");
        var func_declare_line = lines[0];
        var func_pattern = /def(\s)+func\(([\w|\W]*,?)*\):/g;
        var is_valid_function = func_pattern.test(func_declare_line);
        var node = this._currentNode;

        // TODO: show error in case the function is not a valid python function
        // Consider http://esprima.org/index.html 

        if (is_valid_function) {
            //TODO : validate singature
            var start_pos = func_declare_line.indexOf("(");
            var end_pos = func_declare_line.indexOf(")");
            var parameter = func_declare_line.substr(start_pos + 1, end_pos - start_pos - 1);
            parameters = parameter.split(",");
            this._currentNode.port().input = [];

            if (node.port().input.length == 0) {
                for (i = 0; i < parameters.length; i++) {
                    var port = { "name": parameters[i].trim(), "type": "String", "order": i };
                    node.port().input.push(port);
                }
            } else {
                for (i = 0; i < node.port().input.length; i++) {
                    if (parameters[i]) {
                        node.port().input[i].name = parameters[i];
                    }
                }
            }

            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line.startsWith(":params:")) {
                    // do nothing now, use parameter in func def
                } else if (line.startsWith(":ptypes:")) {
                    var types = line.substring(8).split(",");
                    for (var j = 0; j < node.port().input.length; j++) {
                        if (types.length > j) {
                            node.port().input[j].type = types[j].trim();
                        }
                    }

                } else if (line.startsWith(":returns:")) {
                    var rets = line.substring(9).split(",");
                    //Update existing output name
                    for (var j = 0; j < node.port().output.length; j++) {
                        if (rets.length > j) {
                            node.port().output[j].name = rets[j].trim();
                        }
                    }

                    // handling newly added outputs
                    if (node.port().output.length < rets.length) {
                        for (var j = rets.length - node.port().output.length; j < rets.length; j++) {
                            var port = { "name": rets[j].trim(), "type": "String" };
                            node.port().output.push(port);
                        }
                    }
                } else if (line.startsWith(":rtype:")) {
                    var rtypes = line.substring(7).split(",");
                    for (var j = 0; j < node.port().output.length; j++) {
                        if (rtypes.length > j) {
                            node.port().output[j].type = rtypes[j].trim();
                        }
                    }
                }
            }

            this._propertyPanel.update(node);
        }

        /*
        for (var i =0;i< lines.length;i++) {
            var line = lines[i].trim();
            if ( line.startsWith(":params:") ) {
                // do nothing now, use parameter in func def
            } else if ( line.startsWith(":ptypes:") ) {
                var types = line.substring(7).split(",");
                for (j = 0; j < node.port().input.length; i++) {
                    if ( types.length > j ) {
                        node.port().input[j].type = types[j].trim();
                    }
                }

            } else if ( line.startsWith(":returns:") ) {

            } else if ( line.startsWith(":rtype:") ) {

            }  
        }
        */
    };

    Panel.prototype._test = function() {
        var uuid = new Date().getTime();
        var node_test_modal_id = "node-test-modal";
        var node_test_modal_title = "Test Node";
        var node_test_button = "node-test-button"
        var me = this;
        var node = this._currentNode;

        var testModal = Util.getModal(node_test_modal_id, node_test_modal_title, function(modal) {
            var footer = modal.select(".modal-footer");

            footer.append("button").attr("type", "button").classed("btn btn-default", true).attr("id", node_test_button).text("Test");
        });

        var body = testModal.select(".modal-body");
        // Reinit the body every time to make a clean test
        // refer to http://collaboradev.com/2014/03/18/d3-and-jquery-interoperability/
        $(body.node()).empty();

        var form = body.append("form");
        var group = form.selectAll("div").data(node.port().input).enter().append("div").classed("form-group", true);
        group.append("label").text(function(d) {
            return d.name;
        }).style("margin-right", "5px");
        inputs = group.append("input").classed("node_inputs", true);
        var outputs = body.append("div");
        output_result = outputs.append("div").attr("visibility", "hidden").attr("id", "node_output_result").style("overflow", "auto");

        // deregister existing handlers
        $("#" + node_test_button).unbind("click");
        $("#" + node_test_button).click(function() {
            var inputs = d3.selectAll(".node_inputs");
            var output_result = d3.select("#node_output_result");

            // RUN Test
            var ports = [];
            inputs.each(function(d) {
                var o = {};
                o.name = d.name.trim();
                o.value = d3.select(this).property("value");
                ports.push(o);
            })
            var test_flow = new Flow("nodetestflow" + uuid, "nodetestflow");
            var test_node = {};
            test_node.id = "testnodeid" + uuid;
            test_node.spec_id = node.id();
            test_node.name = node.title();
            test_node.ports = ports;
            test_node.is_end = 1;
            test_flow.addnode(test_node);
            test_flow.run(function(data) {
                if (data[0].status == "fail") {
                    output_result.text(data[0].error).attr("visibility", "visible").classed("alert alert-warning", true).classed("alert-success", false);
                } else {
                    //Handling result here
                    output_result.text(js_beautify(JSON.stringify(data[0].outputs))).attr("visibility", "visible").classed("alert alert-success", true).classed("alert-warning", false);
                }
            }, function(data) {
                //handling error here
                output_result.text(js_beautify(JSON.stringify(data))).attr("visibility", "visible").classed("alert alert-warning", true).classed("alert-success", false);
            });
        });

        $("#" + node_test_modal_id).modal('show');
    };

    return Panel;
});