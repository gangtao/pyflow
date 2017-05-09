define([], function() {
    var Flow = function(id, name) {
        this._flow = {};
        this._flow.id = id;
        this._flow.name = name;
        this._flow.nodes = [];
        this._flow.links = [];
        this._connections = [];
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
    }

    return Flow;
});
