define([], function() {
    var Flow = function(id, name) {
        this._flow = {};
        this._flow.id = id;
        this._flow.name = name;
        this._flow.nodes = [];
        this._flow.links = [];
        this._result = undefined; // store flow running results
    };

    Flow.prototype.flow = function() {
        return this._flow;
    };

    Flow.prototype.nodes = function() {
        return this._flow.nodes;
    };

    Flow.prototype.addnode = function(node) {
        this._flow.nodes.push(node);
    };

    Flow.prototype.connections = function() {
        var connections = [];
        this._flow.links.map(function(link) {
            source = link.source.split(":");
            target = link.target.split(":");
            connections.push({
                "sourceId": source[0],
                "targetId": target[0],
                "sourcePort": source[1],
                "targetPort": target[1]
            });
        })

        return connections;
    };

    Flow.prototype._findConnection = function(sourceId, targetId, sourcePort, targetPort) {
        var i = 0,
            index = -1,
            length = this._flow.links.length;

        for (; i < length; i++) {
            var link = this._flow.links[i];
            if (link.source == sourceId + ":" + sourcePort &&
                link.target == targetId + ":" + targetPort) {
                index = i;
            }
        }

        return index;
    };

    Flow.prototype.link = function(link) {
        source = link.source.split(":");
        target = link.target.split(":");
        this.connect(source[0], target[0], source[1], target[1]);
    };

    Flow.prototype.connect = function(sourceId, targetId, sourcePort, targetPort) {
        var index = this._findConnection(sourceId, targetId, sourcePort, targetPort);
        if (index == -1) {
            this._flow.links.push({
                "source": sourceId + ":" + sourcePort,
                "target": targetId + ":" + targetPort
            });
        }

        // TODO: in case it is move from one target to another, need remove the previous link 
    };

    Flow.prototype.disconnect = function(sourceId, targetId, sourcePort, targetPort) {
        var index = this._findConnection(sourceId, targetId, sourcePort, targetPort);

        if (index > -1) {
            this._flow.links.splice(index, 1);
        }
    };

    Flow.prototype.clear = function() {
        this._flow.nodes = [];
        this._flow.links = [];
        this._result = undefined;
    };

    Flow.prototype.findSourcePort = function(nodeId, port) {
        var connections = this.connections();
        var i = 0,
            length = connections.length;

        for (; i < length; i++) {
            if (connections[i].targetId === nodeId && connections[i].targetPort === port) {
                return {
                    "id": connections[i].sourceId,
                    "port": connections[i].sourcePort
                }
            }
        }
    };

    Flow.prototype.findTargetPort = function(nodeId, port) {
        var connections = this.connections();
        var i = 0,
            length = connections.length;

        for (; i < length; i++) {
            if (connections[i].sourceId === nodeId && connections[i].sourcePort === port) {
                return {
                    "id": connections[i].targetId,
                    "port": connections[i].targetPort
                }
            }
        }
    };

    Flow.prototype.setPortValue = function(nodeId, portName, value) {
        var nodes = this._flow.nodes;
        var i = 0,
            length = nodes.length;
        var node = undefined,
            port = undefined;
        for (; i < length; i++) {
            if (nodes[i].id === nodeId) {
                node = nodes[i];
                break;
            }
        }

        if (node === undefined) {
            return;
        }

        i = 0, length = node.ports.length;
        for (; i < length; i++) {
            if (node.ports[i].name === portName) {
                port = node.ports[i];
                break;
            }
        }

        if (port === undefined) {
            node.ports.push({
                "name": portName,
                "value": value
            })
        } else {
            port.value = value;
        }
    };

    Flow.prototype.getPortValue = function(nodeId, portName, nodeSpec) {
        var nodes = this._flow.nodes;
        var i = 0,
            length = nodes.length;
        var node = undefined,
            port = undefined;
        for (; i < length; i++) {
            if (nodes[i].id === nodeId) {
                node = nodes[i];
                break;
            }
        }

        if (node === undefined) {
            return;
        }

        i = 0, length = node.ports.length;
        for (; i < length; i++) {
            if (node.ports[i].name === portName) {
                port = node.ports[i];
                break;
            }
        }

        if (port) {
            return port.value;
        }

        //Port value not set, use default one when the nodeSpec is provided
        if (nodeSpec) {
            i = 0, length = nodeSpec.port.input.length;
            for (; i < length; i++) {
                if (nodeSpec.port.input[i].name === portName && nodeSpec.port.input[i].default !== undefined) {
                    var default_var = nodeSpec.port.input[i].default;
                    if (default_var === "\n") {
                        default_var = "\\n"; //TODO : add generict logic for this.
                    }
                    return default_var;
                }
            }
        }
    };

    Flow.prototype.setEndNode = function(nodeId) {
        var nodes = this._flow.nodes;
        var i = 0,
            length = nodes.length;
        for (; i < length; i++) {
            if (nodes[i].id === nodeId) {
                nodes[i].is_end = 1;
            } else {
                delete nodes[i]["is_end"];
            }
        }
    };

    Flow.prototype.run = function(cb, fail) {
        var me = this;

        $.ajax({
            url: '/runflow',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(this._flow),
            dataType: 'json'
        }).done(function(data) {
            me._result = data;
            cb(data);
        }).fail(function(data) {
            // TODO : error handling here
            console.log(data);
            fail(data);
        });
    };

    Flow.prototype.set = function(id, name) {
        this._flow.id = id;
        this._flow.name = name;
    };

    Flow.prototype._update = function() {
        this._flow.nodes.map(function(node) {
            var el = $("#" + node.id);
            var position = el.position();
            node.ui.x = position.left + "px";
            node.ui.y = position.top + "px";
        });
    };

    Flow.prototype.save = function() {
        this._update();

        $.ajax({
            url: '/flows',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(this._flow),
            dataType: 'json'
        }).done(function(data) {
            console.log(data);
        });
    };

    Flow.prototype.status = function(nodeId) {
        if (this._result === undefined) {
            return "";
        }

        var i = 0,
            length = this._result.length;
        for (; i < length; i++) {
            if (this._result[i].id === nodeId) {
                return this._result[i].status
            }
        }

        return "";
    };

    Flow.prototype.error = function(nodeId) {
        if (this._result === undefined) {
            return "";
        }

        var i = 0,
            length = this._result.length;
        for (; i < length; i++) {
            if (this._result[i].id === nodeId) {
                return this._result[i].error
            }
        }

        return "";
    };

    Flow.prototype.getRunResult = function(nodeId, port) {
        if (this._result === undefined) {
            return undefined;
        }

        var i = 0,
            j = 0,
            length = this._result.length;
        for (; i < length; i++) {
            if (this._result[i].id === nodeId) {
                for (; j < this._result[i].outputs.length; j++) {
                    var aport = this._result[i].outputs[j];
                    if (aport.name === port) {
                        return aport.value;
                    }
                }
            }
        }

        return undefined;
    };

    return Flow;
});