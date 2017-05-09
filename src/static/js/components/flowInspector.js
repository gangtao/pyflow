define(["util"], function(Util) {
    var Inspector = function(rootId) {
        this._rootId = rootId;
    };

    Inspector.prototype.render = function() {
        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "Inspector");
    }

    return Inspector;
});
