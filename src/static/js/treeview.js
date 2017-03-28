function treeview(rootId, data) {
    var root = d3.select("#" + rootId);

    var level1 = root.append("ul").classed("pyflowtree", true).selectAll("li").data(data).enter().append("li");
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

    //$('.mytree li').show();
    //$('.mytree li:first').show();

    $('.tree li').on('click', function(e) {
        var children = $(this).find('> ul > li');
        if (children.is(":visible"))
            children.hide('fast');
        else children.show('fast');
        e.stopPropagation();
    });

    //Handle drag and drop
    $('li').attr('draggable', 'true').on('dragstart', function(ev) {
        //ev.dataTransfer.setData("text", ev.target.id);
        ev.originalEvent.dataTransfer.setData('text', $(ev.target).attr("specId"));
        //console.log('drag start');
    });

}
