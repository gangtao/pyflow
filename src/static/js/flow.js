define(["comp/treeview", "comp/flowCanvas", "comp/flowInspector", "util"], function(TreeView, FlowCanvas, FlowInspector, Util) {
    var Flow = {};

    // -------------------------------------
    //Global Variables
    var nodeTreeSpecification = undefined;
    var currentFlow = {
        "id": "pyflow.builder.gen",
        "name": "SampleFlow",
        "nodes": [],
        "links": []
    };
    var connectionList = [];

    // -------------------------------------

    // -------------------------------------
    // Main UI Logic
    Flow.render = function() {
        $("#mainUI").empty();

        var rootUI = d3.select("#mainUI").append("div").classed("row", true);
        var nodeTree = rootUI.append("div").classed("col-md-3", true).attr("id", "flowTree");

        var flowUI = rootUI.append("div").classed("col-md-8", true).attr("id", "flowUI");
        var flowCanvas = flowUI.append("div").classed("row", true).attr("id", "flowCanvas");
        var flowInspector = flowUI.append("div").classed("row", true).attr("id", "flowInspector");

        // Init Tree 
        $.get("/nodes", function(data) {
            nodeTreeSpecification = data;
            var treeView = new TreeView("flowTree", nodeTreeSpecification)
            treeView.render();

            // Init Flow Canvas Panel
            var flowCanvas = new FlowCanvas("flowCanvas", nodeTreeSpecification);
            flowCanvas.render();

            // Init Flow Inspector
            var inspector = new FlowInspector("flowInspector");
            inspector.render();
        });
    }

    return Flow;
});
