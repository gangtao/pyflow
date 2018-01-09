define(["model/node","util"], function(Node, Util) {
    var Panel = function(rootId, data, codePanel, propertyPanel) {
        this._rootId = rootId;
        this._nodes = [];
        for ( d in data ) {
            this._nodes.push(new Node(data[d]));
        }

        this._codePanel = codePanel;
        this._propertyPanel = propertyPanel;
    };

    Panel.prototype.render = function() {
        $("#" + this._rootId).empty();

        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "NodeList");
        this._body = panel.select(".panel-body").attr("id", "NodeListBody");
        var me = this;

        var nodes = this._nodes;

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

    Panel.prototype._addNode = function(node) {
        var add_modal_id = "add-node-modal";
        var add_modal_titel = "Add New Node";
        var add_node_id = "add_node_id";
        var add_node_name = "add_node_name";
        var add_node_button = "add_node_button";
        var me = this;

        var add_modal = Util.getModal(add_modal_id, add_modal_titel, function(modal) {
            var body = modal.select(".modal-body");
            var footer = modal.select(".modal-footer");

            var form = body.append("form");
            var group1 = form.append("div").classed("form-group",true);
            group1.append("label").attr("for",add_node_id).text("Node ID").style("margin-right","5px");;
            group1.append("a").attr("href","#").attr("id",add_node_id);

            var group2 = form.append("div").classed("form-group",true);
            group2.append("label").attr("for",add_node_name).text("Node Title").style("margin-right","5px");
            group2.append("a").attr("href","#").attr("id",add_node_name);

            $("#" + add_node_id).text("xxx.xxx.xxx").editable();
            $("#" + add_node_name).text("untitled").editable();

            footer.append("button").attr("type","button").classed("btn btn-default",true).attr("id",add_node_button).text("New");
        });

        $("#" + add_node_button).click(function() {
            $("#" + add_modal_id).modal("hide");
            var node = new Node(); 
            node.id($("#" + add_node_id).text());
            node.title($("#" + add_node_name).text());
            me._nodes.push(node);
            me.render();
            me._loadNode(node);
        });

        $("#"+ add_modal_id ).modal('show');
    };

    Panel.prototype._deleteNode = function(node) {
        var delete_modal_id = "delete-node-modal";
        var delete_modal_titel = "Delete Node";
        var delete_node_button = "delete-node-button"
        var me = this;

        deletModal = Util.getModal(delete_modal_id, delete_modal_titel, function(modal) {
            var body = modal.select(".modal-body");
            var footer = modal.select(".modal-footer");

            body.text("Do you want to delete this node " + node.id() + " ?");

            footer.append("button").attr("type","button").classed("btn btn-default",true).attr("id",delete_node_button).text("Delete");
        });

        $("#" + delete_node_button).click(function() {
            $("#" + delete_modal_id).modal("hide");
            // TODO : delete the node;
            node.delete();

            me._nodes = jQuery.grep(me._nodes, function(value) {
              return value !== node;
            });
            me.render();
            me._loadNode(me._nodes[0]);
        });

        $("#"+ delete_modal_id ).modal('show');
    };

    return Panel;
});
