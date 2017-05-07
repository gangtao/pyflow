define([], function() {
	var Util = {};
	
    Util.addPanel = function(parent, title) {
        var panel = parent.append("div").classed("panel panel-default", true);
        if (title != undefined) {
            panel.append("div").classed("panel-heading", true).text(title);
        }
        panel.append("div").classed("panel-body", true);

        return panel
    };

    return Util;
});
