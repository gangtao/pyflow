define(["util"], function(Util) {
    var Panel = function(rootId, data, codePanel, propertyPanel) {
        this._rootId = rootId;
        this._data = data;
        this._codePanel = codePanel;
        this._propertyPanel = propertyPanel;
    };

    Panel.prototype.render = function() {
        $("#" + this._rootId).empty();
        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "NodeList");
        this._body = panel.select(".panel-body").attr("id", "NodeListBody");
        var me = this;

        var nodes = [];
        for (d in this._data) {
            nodes.push(this._data[d])
        };

        var nodeList = this._body.append("ul");
        var nodeItems = nodeList.selectAll("li").data(nodes).enter().append("li").append("div");

        nodeItems.append("a").text(function(d) {
            return d.id;
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
        this._codePanel.text(node.func);
        this._propertyPanel.update(node);
    };

    Panel.prototype._deleteNode = function(node) {

    };

    Panel.prototype._addNode = function(node) {};
    return Panel;
});
