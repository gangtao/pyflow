define([], function() {
    var Flow = function(id, name) {
        this._flow = {};
        this._flow.id = id;
        this._flow.name = name;
        this._flow.nodes = [];
        this._flow.links = [];
        this._connections = [];
        this._lastResult = undefined;
    };

    Flow.prototype.findSourcePort = function(nodeId, port) {
        var i = 0,
            length = this._connections.length;

        for (; i < length; i++) {
            if (this._connections[i].targetId === nodeId && this._connections[i].targetPort === port) {
                return {
                    "id": this._connections[i].sourceId,
                    "port": this._connections[i].sourcePort
                }
            }
        }
    };

    Flow.prototype.flow = function() {
        return this._flow;
    };

    Flow.prototype.connections = function() {
        return this._connections;
    };

    Flow.prototype.connect = function(sourceId, targetId, sourcePort, targetPort) {
        //Update Flow Specification
        this._flow.links.push({
            "source": sourceId + ":" + sourcePort,
            "target": targetId + ":" + targetPort
        });

        //Update Connection List
        this._connections.push({
            "sourceId": sourceId,
            "targetId": targetId,
            "sourcePort": sourcePort,
            "targetPort": targetPort
        });
    };

    Flow.prototype.clear = function() {
        this._flow.nodes = [];
        this._flow.links = [];
        this._connections = [];
        this._lastResult = undefined;
    };

    Flow.prototype.findSourcePort = function(nodeId, port) {
        var i = 0,
            length = this._connections.length;

        for (; i < length; i++) {
            if (this._connections[i].targetId === nodeId && this._connections[i].targetPort === port) {
                return {
                    "id": this._connections[i].sourceId,
                    "port": this._connections[i].sourcePort
                }
            }
        }
    };

    Flow.prototype.findTargetPort = function(nodeId, port) {
        var i = 0,
            length = this._connections.length;

        for (; i < length; i++) {
            if (this._connections[i].sourceId === nodeId && this._connections[i].sourcePort === port) {
                return {
                    "id": this._connections[i].targetId,
                    "port": this._connections[i].targetPort
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

    Flow.prototype.getRunResult = function(nodeId, port) {
        if (this._lastResul === undefined) {
            return undefined;
        }

        var i = 0,
            j = 0,
            length = this._lastResul.length;
        for (; i < length; i++) {
            if (this._lastResul[i].id === nodeId) {;
                for (; j < this._lastResul[i].ports.length; j++) {
                    var aport = this._lastResul[i].ports[j];
                    if (aport.name === port) {
                        return aport.value;
                    }
                }
            }
        }

        return undefined;
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

    Flow.prototype.run = function(cb) {
        $.post("/runflow", { "data": JSON.stringify(this._flow) }, function(data) {
        	console.log(data)
        });
    };

    return Flow;
});
