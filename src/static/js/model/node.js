define([], function() {
    var Node = function(node) {
        this._node = {};
        this._node.func = "";
        this._node.id = id;
        this._node.port = {};
        this._node.title = "";
    };

    Node.prototype.save = function() {
        $.ajax({
            url: '/nodes',
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(this._node),
            dataType: 'json'
        }).done(function( data ) {
            console.log(data);
        });
    };

    return Node;
});