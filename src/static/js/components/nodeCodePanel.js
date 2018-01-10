define(["util"], function(Util) {
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
            // do test
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
        console.log("node saved!");
    };

    Panel.prototype._validate = function(code) {
        var lines = code.split("\n");
        var func_declare_line = lines[0];
        var func_pattern = /def(\s)+func\(([\w|\W]*,?)*\):/g;
        var is_valid_function = func_pattern.test(func_declare_line);
        var node = this._currentNode;

        if (is_valid_function) {
            //TODO : validate singature
            var start_pos = func_declare_line.indexOf("(");
            var end_pos = func_declare_line.indexOf(")");
            var parameter = func_declare_line.substr(start_pos + 1, end_pos - start_pos - 1);
            console.log(parameter);
            parameters = parameter.split(",");
            this._currentNode.port().input = [];
            parameters.map(function(d){
                node.port().input.push({"name":d});
            });
            this._propertyPanel.update(node);
        }
    };

    return Panel;
});