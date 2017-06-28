define(["util"], function(Util) {
    var TreeView = function(rootId, nodeSpec) {
        this._rootId = rootId;
        this._nodeSpec = nodeSpec;
    };

    TreeView.prototype.render = function() {
        var root = d3.select("#" + this._rootId);
        var panel = Util.addPanel(root, "Nodes");

        panel.select(".panel-body").append("div").attr("id", "tree");
        var tree = _list2tree(this._nodeSpec);
        _rendor("tree", tree);
    }

    function _list2tree(nodes) {
        var tree = [{
            "title": "pyflow",
            "id": "pyflow",
            "children": []
        }];

        for (var node in nodes) {
            _insertNode(tree[0], nodes[node]);
        }

        return tree;
    }

    function _insertNode(node, item) {
        if (item === undefined) {
            return;
        }
        var id = item.id;
        var ids = id.split(".");

        var i = 0,
            length = ids.length;
        var checkId = ids[0];

        for (; i < length; i++) {
            if (checkId === node.id) {
                if (i === length - 1) { //Is last Layer /Leaf
                    node.content = item; //override duplicated node, should never run into this now
                    return;

                } else if (i === length - 2) {
                    if (node.children === undefined) {
                        node.children = [];
                    }
                    var newChild = {};
                    newChild.id = checkId + "." + ids[i + 1];
                    newChild.title = ids[i + 1];
                    newChild.content = item;
                    node.children.push(newChild);
                    return;

                } else {
                    if (node.children === undefined) {
                        node.children = [];
                    }
                    var newChild = {};
                    newChild.id = checkId + "." + ids[i + 1];
                    newChild.title = ids[i + 1];
                    _appendChild(node, newChild);
                    node.children.forEach(function(entry) {
                        _insertNode(entry, item);
                    })
                }
            }
            checkId = checkId + "." + ids[i + 1];
        }

    }

    function _appendChild(tree, child) {
        var i = 0,
            length = tree.children.length;
        for (; i < length; i++) {
            if (tree.children[i].id === child.id) {
                return;
            }
        }
        tree.children.push(child);
    }

    function _rendor(rootId, data) {
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
            if (ev.target.parentNode.className != "leaf") {
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
