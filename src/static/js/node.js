define(["comp/nodeListPanel","comp/nodeCodePanel","comp/nodePropertyPanel", "util"], function(NodeListPanel,NodeCodePanel,NodePropertyPanel, Util) {
    var Node = {};
	Node.render = function() {
		$("#mainUI").empty();

		var rootUI = d3.select("#mainUI").append("div").classed("row", true);
        var nodeListPanel = rootUI.append("div").classed("col-md-3", true).attr("id", "nodeListPanel");

        var nodeEditorPanel = rootUI.append("div").classed("col-md-8", true).attr("id", "nodeEditorPanel");
        var nodeCodePanel = nodeEditorPanel.append("div").classed("row", true).attr("id", "nodeCodePanel");
        var nodePropertyPanel = nodeEditorPanel.append("div").classed("row", true).attr("id", "nodePropertyPanel");

        var nodeProperty = new NodePropertyPanel("nodePropertyPanel");
            nodeProperty.render();

        var nodeCode = new NodeCodePanel("nodeCodePanel", nodeProperty);
        nodeCode.render();


        $.get("/nodes", function(data) {
        	var nodeList = new NodeListPanel("nodeListPanel",data,nodeCode,nodeProperty);
        	nodeList.render();
            nodeCode.connectListPanel(nodeList);
        });
	};
	return Node;
});