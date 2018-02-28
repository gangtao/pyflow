from flask import Flask
from flask import request
from flask import jsonify

import os
import json

import nodemaker
import fbp

from fbp.port import Port

app = Flask(__name__, static_url_path="")


@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/nodestree", methods=['GET'])
def nodestree():
    tree = list()
    repository = fbp.repository()
    node_specs = repository.get("nodespec")

    for k, v in node_specs.iteritems():
        _insert(tree, v)
    return jsonify(tree)


def _insert(treeroot, node):
    id = node["id"]
    ids = id.split(".")
    found = False

    for n in treeroot:
        if n["id"] == ids[0]:
            found = True
            _inset_node(n, node, ids)

    if not found:
        item = dict()
        item["id"] = ids[0]
        item["title"] = ids[0]
        item["children"] = list()
        treeroot.append(item)
        _inset_node(item, node, ids)

    return


def _inset_node(parent, node, path):
    if len(path) == 1:
        if path[0] == parent["id"]:
            parent["value"] = node
    else:
        if path[0] == parent["id"]:
            children = parent["children"]
            found = False
            for item in children:
                if item["id"] == path[1]:
                    _inset_node(item, node, path[1:])
                    found = True

            if not found:
                item = dict()
                item["id"] = path[1]
                item["title"] = path[1]
                item["children"] = list()
                parent["children"].append(item)
                _inset_node(item, node, path[1:])
    return


@app.route("/nodes", methods=['GET', 'POST'])
def nodes():
    repository = fbp.repository()
    if request.method == 'POST':
        node = request.get_json()
        repository.register("nodespec", node["id"], node)
        return jsonify(node), 200, {'ContentType': 'application/json'}
    else:
        node_specs = repository.get("nodespec")

        # Adding default output when it is not there
        for k, v in node_specs.iteritems():
            if not v["port"].has_key("output"):
                v["port"]["output"] = list()
                v["port"]["output"].append({"name": "out"})

        return jsonify(node_specs), 200, {'ContentType': 'application/json'}


@app.route("/nodes/<id>", methods=['GET', 'DELETE', 'PUT'])
def get_node(id):
    repository = fbp.repository()
    if request.method == 'GET':
        node = repository.get("nodespec", id)
        return jsonify(node), 200, {'ContentType': 'application/json'}
    elif request.method == 'DELETE':
        repository.unregister("nodespec", id)
        return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}
    elif request.method == 'PUT':
        node = request.get_json()
        # TODO Valude the node here
        repository.register("nodespec", id, node)
        return jsonify(node), 200, {'ContentType': 'application/json'}

    return json.dumps({'success': False}), 400, {'ContentType': 'application/json'}


@app.route("/flows", methods=['GET', 'POST'])
def flows():
    repository = fbp.repository()
    if request.method == 'POST':
        flow = request.get_json()
        repository.register("flow", flow["id"], flow)
        return jsonify(flow)
    else:
        flows = repository.get("flow")
        if flows is None:
            return jsonify({})

        result = [v for k, v in flows.items()]
        return jsonify(result)


@app.route("/flows/<id>", methods=['GET'])
def get_flow(id):
    repository = fbp.repository()
    node = repository.get("flow", id)
    return jsonify(node)


@app.route("/runflow", methods=['POST'])
def runflow():
    try:
        data = request.get_json()
        return jsonify(fbp.run_flow(data))
    except Exception as e:
        return json.dumps({"error": str(e)}), 500


@app.route("/dumprepo", methods=['POST'])
def dumprepo():
    try:
        data = request.get_json()
        repository = fbp.repository()
        repository.dumps(data["path"])
        return jsonify(data)
    except Exception as e:
        return json.dumps({"error": str(e)}), 500


@app.route("/loadrepo", methods=['POST'])
def loadrepo():
    try:
        data = request.get_json()
        repository = fbp.repository()
        repository.loads(data["path"])
        return jsonify(data)
    except Exception as e:
        return json.dumps({"error": str(e)}), 500


@app.route("/ports/types", methods=['GET'])
def get_supported_port_types():
    return jsonify(types=Port.support_types())


def load_node_spec():
    records = []
    for file in os.listdir('node_specs'):
        if file.endswith('.py') and file != '__init__.py':
            with open('node_specs' + os.path.sep + file)as f:
                spec = nodemaker.create_node_spec(f.read())
                records.append(json.dumps(spec))

    repository = fbp.repository()
    for r in records:
        node = json.loads(r)
        repository.register("nodespec", node["id"], node)


def init():
    # load node spec from spec folders
    load_node_spec()

    # TODO
    # initialize flows


if __name__ == "__main__":
    init()
    app.run(host="0.0.0.0", threaded=True)
