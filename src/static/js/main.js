jsPlumb.ready(function() {
    console.log("jsPlumb is ready to use");

    $("#menuFlow").click(function() {
        toggleMenu($(this));
        renderFlow();
    });

    $("#menuNode").click(function() {
        toggleMenu($(this));
        renderNode();
    });

    renderFlow();
});

function toggleMenu(me) {
    if (!me.parent().hasClass("active")) {
        $("#menuNode").parent().toggleClass("active");
        $("#menuFlow").parent().toggleClass("active");
    }
}
