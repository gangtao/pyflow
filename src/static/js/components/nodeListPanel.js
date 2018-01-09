define(["model/node","util"], function(Node, Util) {
    var Panel = function(rootId, data, codePanel, propertyPanel) {
        this._rootId = rootId;
        this._nodes = data;
        this._codePanel = codePanel;
        this._propertyPanel = propertyPanel;
        this._addModalId = "add-node-modal";
        this._addModalTitel = "Add New Node";
    };

    Panel.prototype.render = function() {
        $("#" + this._rootId).empty();

        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "NodeList");
        this._body = panel.select(".panel-body").attr("id", "NodeListBody");
        var me = this;

        var nodes = [];
        for (d in this._nodes) {
            nodes.push(new Node(this._nodes[d]))
        };

        var nodeList = this._body.append("ul");
        var nodeItems = nodeList.selectAll("li").data(nodes).enter().append("li").append("div");

        nodeItems.append("a").text(function(d) {
            return d.id();
        }).on("click", function(d) {
            me._loadNode(d);
        });

        nodeItems.append("a").classed("glyphicon glyphicon-remove-circle flowbutton", true).on("click", function(d) {
            me._deleteNode(d);
        });

        var addItems = nodeList.append("li").append("div").append("a").classed("glyphicon glyphicon-plus", true).on("click", function(d) {
            me._addNode();
        });
    };

    Panel.prototype._loadNode = function(node) {
        this._codePanel.update(node);
        this._propertyPanel.update(node);
    };

    Panel.prototype._deleteNode = function(node) {

    };

    Panel.prototype._addNode = function(node) {
        this._addModal = Util.getModal(this._addModalId, this._addModalTitel, function(modal) {
            var body = modal.select(".modal-body");
            var footer = modal.select(".modal-footer");
        });

        // convert d3 selection to jquery one
        // refer to http://collaboradev.com/2014/03/18/d3-and-jquery-interoperability/
        $("#"+ this._addModalId ).modal('show');
    };
    return Panel;
});
