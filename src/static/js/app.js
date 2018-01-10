require(["flow","node", "util"], function(Flow, Node, Util) {

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

        $("#load-action-menu").click(function() {
            loadRepo();
        });

        $("#dump-action-menu").click(function() {
            dumpRepo();
        });

        Flow.render();
    });

    function toggleMenu(me) {
        if (!me.parent().hasClass("active")) {
            $("#menuNode").parent().toggleClass("active");
            $("#menuFlow").parent().toggleClass("active");
        }
    }

    function loadRepo() {
        var modal_id = "repo_load_modal";
        var load_button_id = "repo_load_action";

        var modal = Util.getModal(modal_id, "Load Repo", function(modal) {
            var body = modal.select(".modal-body");
            var footer = modal.select(".modal-footer");
            footer.append("button").attr("type", "button").classed("btn btn-default", true).attr("id", load_button_id).text("Load");
        });

        $("#" + load_button_id).click(function() {
            //DO Dumps here
            $("#" + modal_id).modal('hide');
        });

        $("#" + modal_id).modal('show');
    }

    function dumpRepo() {
        var modal_id = "repo_dump_modal";
        var dump_button_id = "repo_dump_action";

        var modal = Util.getModal(modal_id, "Dump Repo", function(modal) {
            var body = modal.select(".modal-body");
            var footer = modal.select(".modal-footer");
            footer.append("button").attr("type", "button").classed("btn btn-default", true).attr("id", dump_button_id).text("Dump");
        });

        $("#" + dump_button_id).click(function() {
            //DO Dumps here
            $("#" + modal_id).modal('hide');
        });

        $("#" + modal_id).modal('show');
    }

});
