require(["flow","node"], function(Flow, Node) {

    jsPlumb.ready(function() {
        console.log("jsPlumb is ready to use");

        $.fn.editable.defaults.mode = 'inline';

        $("#menuFlow").click(function() {
            toggleMenu($(this));
            Flow.render();
        });

        $("#menuNode").click(function() {
            toggleMenu($(this));
            Node.render();
        });

        Flow.render();
    });

    function toggleMenu(me) {
        if (!me.parent().hasClass("active")) {
            $("#menuNode").parent().toggleClass("active");
            $("#menuFlow").parent().toggleClass("active");
        }
    }

});
