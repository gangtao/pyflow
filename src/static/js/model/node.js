define([], function() {
	var default_func = "def func():\n\t return None";

    var Node = function(node) {
        if (node === undefined) {
            this._node = {};
            this._node.id = undefined;
            this._node.func = default_func;
            // Default port is empty input  
            // and default out for output
            this._node.port = {};
            this._node.port.input = [];
            this._node.port.output = [];
            this._node.port.output.push({"name":"out","type":"String"});
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

    Node.prototype.delete = function() {
        $.ajax({
            url: '/nodes/' + this.id(),
            contentType: 'application/json',
            type: 'DELETE',
            dataType: 'json'
        }).done(function(data) {
            console.log(data);
        });
    };

    return Node;
});