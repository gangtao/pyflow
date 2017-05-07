define([], function() {
    var TreeView = {};

    TreeView.rendor = function(rootId, data) {
        var root = d3.select("#" + rootId);

        var level1 = root.append("ul").classed("pyflowtree", true).selectAll("li").data(data).enter().append("li").classed("branch", true);
        level1.append("a").attr("href", "#").text(function(d) {
            return d.title;
        });

        var depth = 4,
            i = 0,
            previousLevel = level1;

        for (; i < depth; i++) {
            var currentLevel = previousLevel.append("ul").classed("tree", true).selectAll("li").classed("level-" + i, true).data(function(d) {
                if (d.children !== undefined) {
                    return d.children;
                } else {
                    return []
                }
            }).enter().append("li").style("display", function() {
                if (i > 0) {
                    return "None";
                } else {
                    return "list-item";
                }
            });

            currentLevel.each(function(d) {
                if (d.children == undefined || d.children.length == 0) {
                    d3.select(this).classed("leaf", tree);
                } else {
                    d3.select(this).classed("branch", tree);
                }
            })

            currentLevel.append("a").attr("href", "#").text(function(d) {
                if (d.children && d.children.length > 0) {
                    return d.title + " +";
                }
                return d.title;
            }).attr("specId", function(d) {
                if (d.id) {
                    return d.id;
                }
            });

            previousLevel = currentLevel;
        }

        $('.tree li').on('click', function(e) {
            var children = $(this).find('> ul > li');
            if (children.is(":visible"))
                children.hide('fast');
            else children.show('fast');
            e.stopPropagation();
        });

        //Disable drag on non-leaf node
        $('.branch').attr('draggable', 'false').on('dragstart', function(ev) {
            if ( ev.target.parentNode.className != "leaf" ) {
                ev.stopPropagation();
                return false;
            } 
        });

        //Handle drag and drop
        $('.leaf').attr('draggable', 'true').on('dragstart', function(ev) {
            ev.originalEvent.dataTransfer.setData('text', $(ev.target).attr("specId"));
        });
    };

    return TreeView;
});
