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
    // console.log("[init_targets] targets: " + localStorage['targets']);
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
    // console.log("[all_dash_names] " + keys);
    return keys;
}

function all_targets_for_dash(_dash_name) {
    var targets = localStorage['targets'];
    // console.log("[all_targets_for_dash] targets: " + localStorage['targets']);
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
    // console.log("[update_targets_for_dash] new targets: " + json);
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
