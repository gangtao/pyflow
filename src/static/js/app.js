require(["flow", "node", "model/repo", "util"], function(Flow, Node, Repo, Util) {

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
        var file_path_id = "repo_load_file_path";

        var modal = Util.getModal(modal_id, "Load Repo", function(modal) {
            var body = modal.select(".modal-body");
            var form = body.append("form");
            var group = form.append("div").classed("form-group", true);
            group.append("label").text("Full File Path").style("margin-right", "5px");
            group.append("a").attr("href", "#").attr("id", file_path_id);

            $("#" + file_path_id).text("/tmp/repo.json").editable();

            var footer = modal.select(".modal-footer");
            footer.append("button").attr("type", "button").classed("btn btn-default", true).attr("id", load_button_id).text("Load");
        });

        $("#" + load_button_id).click(function() {
            //Do load here
            var file = d3.select("#" + file_path_id).text();
            console.log(file);
            var repo = new Repo();
            repo.load(file);
            $("#" + modal_id).modal('hide');
        });

        $("#" + modal_id).modal('show');
    }

    function dumpRepo() {
        var modal_id = "repo_dump_modal";
        var dump_button_id = "repo_dump_action";
        var file_path_id = "repo_dump_file_path";

        var modal = Util.getModal(modal_id, "Dump Repo", function(modal) {
            var body = modal.select(".modal-body");
            var footer = modal.select(".modal-footer");

            var form = body.append("form");

            var group = form.append("div").classed("form-group", true);
            group.append("label").text("Full File Path").style("margin-right", "5px");
            group.append("a").attr("href", "#").attr("id", file_path_id);

            $("#" + file_path_id).text("/tmp/repo.json").editable();

            footer.append("button").attr("type", "button").classed("btn btn-default", true).attr("id", dump_button_id).text("Dump");
        });

        $("#" + dump_button_id).click(function() {
            //DO Dumps here
            var file = d3.select("#" + file_path_id).text();
            console.log(file);
            var repo = new Repo();
            repo.dump(file);
            $("#" + modal_id).modal('hide');
        });

        $("#" + modal_id).modal('show');
    }

});