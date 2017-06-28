define(["util"], function(Util) {
    var Panel = function(rootId) {
        this._rootId = rootId;
    };

    Panel.prototype.render = function() {
        $("#" + this._rootId).empty();
        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "Node Property");
        this._body = panel.select(".panel-body").attr("id", "NodePropertyBody");
    };

    Panel.prototype.update = function(node) {
        $("#NodePropertyBody").empty();
        var me = this;

        var table = this._body.append("table").classed("table table-bordered table-condensed", true);
        var tbody = table.append("tbody");

        var row_id = tbody.append("tr");
        row_id.append("td").text("ID");
        row_id.append("td").text(node.id);

        var row_title = tbody.append("tr");
        row_title.append("td").text("Title");
        row_title.append("td").text(node.title);

        var row_port = tbody.append("tr");
        row_port.append("td").text("Ports");
        var portDiv = row_port.append("td").append("div");
        this._updatePorts(node.port, portDiv);
    };

    Panel.prototype._updatePorts = function(ports, div) {
        var table = div.append("table").classed("table table-bordered table-condensed", true);
        var header = ["type","name","default"];
        table.append("thead").selectAll("tr").data(header).enter().append("th").text(function(d){
            return d;
        });

        var tbody = table.append("tbody");

        var content = [];

        ports.input.map(function(p) {
            var item = {};
            item.type = "input";
            $.extend(item,p);
            content.push(item);
        });

        ports.output.map(function(p) {
            var item = {};
            item.type = "output";
            $.extend(item,p);
            content.push(item);
        });

        

        var port_row = tbody.selectAll("tr").data(content).enter().append("tr");

        port_row.append("td").text(function(d){
            return d.type;
        });
        port_row.append("td").text(function(d){
            return d.name;
        });
        port_row.append("td").text(function(d){
            if ( d.default == undefined ) {
                return "";
            }
            return d.default;
        });
    };

    return Panel;
});
