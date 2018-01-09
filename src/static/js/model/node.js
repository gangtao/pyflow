define([], function() {
    var Node = function(node) {
        if (node === undefined) {
            this._node = {};
            this._node.id = undefined;
            this._node.func = "";
            this._node.port = {};
            this._node.title = "";
        } else {
            this._node = node
        }
    };

    Node.prototype.node = function(node) {
        if (node === undefined) {
            return this._node;
        }
        this._node = node
    };

    Node.prototype.id = function(id) {
        if (id === undefined) {
            return this._node.id;
        }
        this._node.id = id
    };

    Node.prototype.port = function(port) {
        if (port === undefined) {
            return this._node.port;
        }
        this._node.port = port
    };

    Node.prototype.title = function(title) {
        if (title === undefined) {
            return this._node.title;
        }
        this._node.title = title
    };

    Node.prototype.func = function(func) {
        if (func === undefined) {
            return this._node.func;
        }
        this._node.func = func
    };

    Node.prototype.save = function() {
        $.ajax({
            url: '/nodes',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(this._node),
            dataType: 'json'
        }).done(function(data) {
            console.log(data);
        });
    };

    return Node;
});