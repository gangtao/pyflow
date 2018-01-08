define(["util"], function(Util) {
    var Panel = function(rootId, propertyPanel) {
        this._rootId = rootId;
        this._editor = undefined;
        this._propertyPanel = propertyPanel;
        this._currentNode = undefined;
    };

    Panel.prototype.render = function() {
        $("#" + this._rootId).empty();
        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "Node Code");
        var me = this;
        this._body = panel.select(".panel-body").attr("id", "NodeCodeBody");
        this._body.append("textarea").classed("form-control", true).attr("id", "NodeCodeEditor");

        root.select(".panel-heading").append("button").classed("glyphicon glyphicon-floppy-save flowbutton", true).on("click", function() {
            me._save();
        });

        this._editor = CodeMirror.fromTextArea(document.getElementById("NodeCodeEditor"), {
            lineNumbers: true,
            indentUnit: 4,
            mode: "python",
            theme: "icecoder"
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
        this.text(node.func);
    };

    Panel.prototype._save = function() {
        this._currentNode.func = this._editor.getValue();
        // TODO : update node
        console.log("Save clicked!");
    };

    return Panel;
});
