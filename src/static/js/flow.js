define(["comp/treeview", "comp/flowCanvas", "comp/flowInspector", "util"], function(TreeView, FlowCanvas, FlowInspector, Util) {
    var Flow = {};
    var canvas = undefined;

    Flow.render = function() {
        $("#mainUI").empty();

        var rootUI = d3.select("#mainUI").append("div").classed("row", true);
        var nodeTree = rootUI.append("div").classed("col-md-3", true).attr("id", "flowTree");

        var flowUI = rootUI.append("div").classed("col-md-8", true).attr("id", "flowUI");
        var flowCanvas = flowUI.append("div").classed("row", true).attr("id", "flowCanvas");
        var flowInspector = flowUI.append("div").classed("row", true).attr("id", "flowInspector");

        // Init Tree 
        $.get("/nodes", function(data) {
            var nodeTreeSpecification = data;
            var treeView = new TreeView("flowTree", nodeTreeSpecification)
            treeView.render();
            
            // Init Flow Inspector
            var inspector = new FlowInspector("flowInspector");
            inspector.render();
            
            canvas = new FlowCanvas("flowCanvas", nodeTreeSpecification, inspector );
            canvas.render(); 
        });
    }

    return Flow;
});
