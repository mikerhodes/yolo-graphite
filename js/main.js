
function base_url() {
    var root = 'http://' + graphite_host + '/render/?';
    var params = new Array(
        "width=1000",
        "height=300",
        "lineWidth=2",
        "yMin=0"
        );
    root += params.join("&");
    root += "&";
    return root;
}

function url_for(target) {
    var input_params = input_params_for(target);
    var url = base_url() + input_params;
    return url;
}

function input_params_for(target) {
    var input_params = target["input_params"];
    return input_params;
}

function appendGraph(target_index) {
    target_for_index(target_index, function(target) {
        var url = url_for(target);
        var input_params = input_params_for(target);
        var refresh = target["refresh"];

        var insert = '<div class="graph" data-targetIndex="' + target_index + '">';
        insert += '<p class="legend">' + input_params + '</p>';
        insert += '<img src="' + url + '" width="1000" height="300" class="img-graph"/>';
        insert += '<div class="controls">';
        insert += '<p><a href="' + url + '">go</a></p>';
        if (refresh) {
            insert += '<p><input type="checkbox" class="refresh" checked="checked"/> Refresh</p>';
        } else {
            insert += '<p><input type="checkbox" class="refresh"/> Refresh</p>';
        }
        insert += '<p><input type="button" value="Remove" class="remove-graph-button"/></p>';
        insert += '</div>';
        insert += '</div>';
        // alert(insert);
        $("#graphs").prepend(insert);
    });
}

function load_all_graphs() {
    $("#graphs").empty();

    all_targets_for_dash(dash_name, function(targets) {
        targets.forEach(function(element, index, array) {
            // console.log("a[" + index + "] = " + JSON.stringify(element));
            appendGraph(index);
        });
    });
}

function refresh_all_graphs() {

    if (document[hidden]) {
        // console.log("Hidden; skipping refresh.");
        return;
    } else {
        // console.log("Not hidden; refresh.");
    }

    var graphs = $(".graph");
    graphs.each(function(index, element) {
        var that = $(this);
        var refresh = that.find('input.refresh').is(':checked');
        if (!refresh) { return; }
        var target_index = parseInt(that.attr("data-targetIndex"));

        target_for_index(target_index, function(target) {
            var url = url_for(target);
            d = new Date();
            url = url + "&nonce=" + d.getTime();
            // console.log(url);
            that.find("img.img-graph").attr("src", url);
        });
    });
}

// Refresh the graphs when the window's back in the foreground,
// for graphs with refresh=true
function handleVisibilityChange() {
  if (!document[hidden]) {
    // console.log("Into the foreground");
    refresh_all_graphs();
  }
}

/* -------------------------------------------------------------------------- */


$(window).load(function() {

    var localStorageAvaliable = false;
    try {
        localStorageAvaliable = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        alert("yolo-graphite requires localStorage which your browser lacks; quitting.");
        return;
    }

    init_targets();
    load_all_graphs();

    // Set up labels and things in the page.
    document.title = dash_name + " -- yolo-graphite";
    $(".base-url-value").text(base_url());
    $("#graphite-host").text(graphite_host);
    $("#dash-name").text(dash_name);

    all_targets_for_dash(dash_name, function(targets) {
        $("#dash-code textarea").text(JSON.stringify(targets, null, "  "));
    });
    all_dash_names(function(names) {
        var links = [];
        names.forEach(function(element, index, array) {
            var url = new URI(document.location);
            url.search(function(data) {
                data.dash = element;
            });
            var link;
            if (element === dash_name) {
                link = '<strong>'+ element +' &raquo;</strong>';
            } else {
                link = '<a href="'+ url.href() + '">'+ element +'</a>';
            }
            links.push(link);
        })
        $("#dash-names").html(links.join("<br/> "));
    });

    // Refresh graphs -- on interval and depending on page visibility
    var intervalID = window.setInterval(refresh_all_graphs, 60000);
    document.addEventListener(visibilityChange, handleVisibilityChange, false);

    // Show/hide the add form, and store state
    if (localStorage["show-add-form"] == "false") {
        $("#add-graph").hide();
    }
    $("#show-hide-add").click(function() {
        $("#add-graph").toggle();
        localStorage["show-add-form"] = $("#add-graph").is(":visible");
        return false;
    });

    // Allow editing and sharing of dashboards
    $("#show-dash-code").click(function() {
        $("#dash-code").toggle();
        return false;
    });
    $("#dash-code-save").click(function() {
        targets = $("#dash-code textarea").val();
        // alert(targets);

        try {
            targets = JSON.parse(targets);  // makes sure valid too
            update_targets_for_dash(dash_name, targets);
            alert("Saved new JSON for " + dash_name);
            $("#dash-code").hide();
            load_all_graphs();
        } catch (e) {
            console.error("Parsing error:", e);
            alert("Not saved. " + e);
        }
        return false;
    });

    // Modify the graphs
    $("#add-graph-button").click(function() {

        var input_params = $("#graph-params").val();
        // alert(params);

        var target_details = {
            "input_params": input_params
        };
        prepend_target(target_details, function() {
            load_all_graphs();
        });

        return false;
    });

    $("#graphs").on("click", ".remove-graph-button", function() {
        var that = $(this);

        var graph_el = that.closest(".graph");
        var target_index = parseInt(graph_el.attr("data-targetIndex"));
        // alert(target_index);

        remove_target(target_index, function() {
            load_all_graphs();
        });

        return false;
    });

    // Save refresh state for graphs
    $("#graphs").on("change", ".refresh", function() {
        var that = $(this);

        var graph_el = that.closest(".graph");
        var target_index = parseInt(graph_el.attr("data-targetIndex"));

        target_for_index(target_index, function(details) {
            details["refresh"] = that.is(":checked");
            console.log('[refresh] saved refresh: ' + details["refresh"]);
            update_target(target_index, details);
        });
    });

    // A new dashboard just redirects to the right URL
    $("#new-dash-button").click(function() {
        var name = $("#new-dash-name").val();
        var url = new URI(document.location);
        url.search(function(data) {
            data.dash = name;
        });
        document.location = url;
    });


});
