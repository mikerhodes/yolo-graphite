var uri = document.location;
var parsed = parseUri(uri);

var graphite_host = parsed.queryKey.host;
var dash_name = parsed.queryKey.dash || "default";


// console.log(graphite_host);
// console.log(dash_name);

/*

All data is stored in a PouchDB database, "yolo-graphite".

Dashboards are stored in documents of type "dashboard".
{
    type: "dashboard",
    name: "name",
    targets: [... ids of targets ...]
}

*/
var db = new PouchDB('yolo-graphite');
var remoteCouch = false;

db.info(function(err, info) {
    console.log("Opened database: " + JSON.stringify(info, null, "  "));
});

// db.allDocs({include_docs: false}, function(err, response) {
//     console.log("[allDocs]: " + JSON.stringify(response, null, "  "));
// });


function dashboard_id(_dash_name) {
    var id = "yolo-dashboard-v1-" + _dash_name;
    return id;
}

function init_targets() {
    // make sure we've a document for this target
    var id = dashboard_id(dash_name);
    db.get(id, function(err, doc) {
        if (doc === undefined) {
            db.put(
                {
                    _id: id,
                    type: "dashboard",
                    name: dash_name,
                    "targets": []
                },
                function(err, response) {
                    console.log("Created dashboard doc: " + id);
                }
            );
        } else {
            console.log("Existing dashboard doc: " + id);
        }
    });
}

function all_dash_names(callback) {
    function map(doc) {
        // console.log("[map] " + JSON.stringify(doc));
        if(doc.type && doc.type === "dashboard") {
            emit(doc.name, null);
        }
    }
    db.query({map: map}, {reduce: false}, function(err, response) {
        var dashboards = [];
        response.rows.forEach(function(row) {
            dashboards.push(row.key);
        });
        console.log("[all_dash_names] " + dashboards);
        callback(dashboards);
    });
}

function all_targets_for_dash(_dash_name, callback) {
    var id = dashboard_id(_dash_name);
    db.get(id, function(err, doc) {
        console.log('[all_targets_for_dash] ' + JSON.stringify(doc, null, " "));
        callback(doc.targets);
    });
}

function update_targets_for_dash(_dash_name, _targets, callback) {
    var id = dashboard_id(_dash_name);
    db.get(id, function(err, doc) {
        console.log('[update_targets_for_dash] ' + JSON.stringify(doc, null, " "));
        doc.targets = _targets;
        db.put(doc, function(err, response) {
            if (err) {
                alert(err + ": " + response);
            } else {
                console.log("Saved update to targets");
            }
            if (callback) { callback(); }
        });
    });
}

function target_for_index(target_index, callback) {
    all_targets_for_dash(dash_name, function(targets) {
        callback(targets[target_index]);
    });
}

function prepend_target(target_details, callback) {
    all_targets_for_dash(dash_name, function(targets) {
        targets.push(target_details);
        update_targets_for_dash(dash_name, targets, function() {
            if (callback) { callback(); }
        });
    });
}

function remove_target(target_index, callback) {
    all_targets_for_dash(dash_name, function(targets) {
        targets.splice(target_index, 1);
        update_targets_for_dash(dash_name, targets, function() {
            if (callback) { callback(); }
        });
    });
}

function update_target(target_index, target_details, callback) {
    all_targets_for_dash(dash_name, function(targets) {
        targets.splice(target_index, 1, target_details);
        update_targets_for_dash(dash_name, targets, function() {
            if (callback) { callback(); }
        });
    });
}
