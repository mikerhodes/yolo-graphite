
var uri = document.location;
var parsed = parseUri(uri);

var graphite_host = parsed.queryKey.host;
// alert(graphite_host);

var dash_name = parsed.queryKey.dash_name || "default";
var dash_name = parsed.queryKey.dash || dash_name;
// alert(dash_name);

function init_targets() {
    var targets = localStorage['targets'];
    if (!targets) {
        var ob = {};
        ob[dash_name] = [];
        localStorage['targets'] = JSON.stringify(ob);
    }
    console.log("[init_targets] targets: " + localStorage['targets']);
}

function all_dash_names() {
    var targets = localStorage['targets'];
    targets = JSON.parse(targets);
    var keys= [];
    for (var name in targets) {
        if (targets.hasOwnProperty(name)) {
            keys.push(name);
        }
    }
    console.log("[all_dash_names] " + keys);
    return keys;
}

function all_targets_for_dash(_dash_name) {
    var targets = localStorage['targets'];
    console.log("[all_targets_for_dash] targets: " + localStorage['targets']);
    targets = JSON.parse(targets);
    if (!targets[_dash_name]) {
        targets[_dash_name] = [];
    }
    return targets[_dash_name];
}

function update_targets_for_dash(_dash_name, _targets) {
    var all_targets = JSON.parse(localStorage['targets']);
    all_targets[_dash_name] = _targets;
    var json = JSON.stringify(all_targets);
    console.log("[update_targets_for_dash] new targets: " + json);
    localStorage["targets"] = json;
}

function target_for_index(target_index) {
    var targets = all_targets_for_dash(dash_name);
    return targets[target_index];
}

function prepend_target(target_details) {
    var targets = all_targets_for_dash(dash_name);
    targets.push(target_details);
    update_targets_for_dash(dash_name, targets);
}

function remove_target(target_index) {
    var targets = all_targets_for_dash(dash_name);
    targets.splice(target_index, 1);
    update_targets_for_dash(dash_name, targets);
}

function update_target(target_index, target_details) {
    var targets = all_targets_for_dash(dash_name);
    targets.splice(target_index, 1, target_details);
    update_targets_for_dash(dash_name, targets);
}


/* -------------------------------------------------------------------------- */


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

function url_for(target_index) {
    var input_params = input_params_for(target_index);
    var url = base_url() + input_params;
    return url;
}

function input_params_for(target_index) {
    var input_params = target_for_index(target_index)["input_params"];
    return input_params;
}

function appendGraph(target_index) {
    var url = url_for(target_index);
    var input_params = input_params_for(target_index);
    var refresh = target_for_index(target_index)["refresh"];

    var insert = '<div class="graph" data-targetIndex="' + target_index + '">';
    insert += '<p class="legend">' + input_params + ' <a href="' + url + '">go</a></p>';
    insert += '<img src="' + url + '" width="1000" height="300" class="img-graph"/>';
    insert += '<div class="controls">';
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
}

function load_all_graphs() {
    $("#graphs").empty();

    var targets = all_targets_for_dash(dash_name);
    targets.forEach(function(element, index, array) {
        console.log("a[" + index + "] = " + JSON.stringify(element));
        appendGraph(index);
    });
}

function refresh_all_graphs() {
    var graphs = $(".graph");
    graphs.each(function(index, element) {
        var that = $(this);
        var refresh = that.find('input.refresh').is(':checked');
        if (!refresh) { return; }
        var target_index = parseInt(that.attr("data-targetIndex"));
        var url = url_for(target_index);
        d = new Date();
        url = url + "&nonce=" + d.getTime();
        console.log(url);
        // that.find("img.img-graph").attr("src", url).fadeOut( "slow", function() {
        //     that.find("img.img-graph").fadeIn("slow");
        // });
        that.find("img.img-graph").attr("src", url);
    });
}


/* -------------------------------------------------------------------------- */


$(window).load(function() {

    var localStorageAvaliable = false;
    try {
        localStorageAvaliable = 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        alert("no local storage!");
    }

    if (localStorageAvaliable) {
        init_targets();
        load_all_graphs();
    }

    $(".base-url-value").text(base_url());
    $("#graphite-host").text(graphite_host);
    $("#dash-name").text(dash_name);
    $("#dash-names").text(all_dash_names().join(", "));
    document.title = dash_name + " -- yolo-graphite";

    var intervalID = window.setInterval(refresh_all_graphs, 60000);

    $("#add-graph-button").click(function() {

        var input_params = $("#graph-params").val();
        // alert(params);

        if (localStorageAvaliable) {
            var target_details = {
                "input_params": input_params
            };
            prepend_target(target_details);
            load_all_graphs();
        } else {
            appendGraph(target_index);
        }

        return false;
    });

    $("#graphs").on("click", ".remove-graph-button", function() {
        var that = $(this);

        var graph_el = that.closest(".graph");
        var target_index = parseInt(graph_el.attr("data-targetIndex"));
        // alert(target_index);

        if (localStorageAvaliable) {
            remove_target(target_index);
            load_all_graphs();
        } else {
            graph_el.remove();
        }

        return false;
    });

    $("#graphs").on("change", ".refresh", function() {
        var that = $(this);

        var graph_el = that.closest(".graph");
        var target_index = parseInt(graph_el.attr("data-targetIndex"));

        var details = target_for_index(target_index);
        details["refresh"] = that.is(":checked");
        console.log('[refresh] saved refresh: ' + details["refresh"]);
        update_target(target_index, details);
    });

});
