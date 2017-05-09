"""Flow library"""
import json

from node import node
from flow import flow

__version_info__ = (0, 0, 1)
__version__ = ".".join(map(str, __version_info__))

# TODO : consider to use meta class


def singleton(class_):
    instances = {}

    def getinstance(*args, **kwargs):
        if class_ not in instances:
            instances[class_] = class_(*args, **kwargs)
        return instances[class_]
    return getinstance


@singleton
class repository(object):
    _repo = {}

    def register(self, domain, key, value):
        if self._repo.get(domain) is None:
            self._repo[domain] = {}

        self._repo[domain][key] = value

    def unregister(self, domain, key):
        if self._repo.get(domain) is None:
            return

        if self._repo.get(domain).get(key) is None:
            return

        del self._repo.get(domain)[key]

    def get(self, domain, key=None):
        if domain is None:
            return None

        if self._repo.get(domain) is None:
            return None

        if key is None:
            return self._repo.get(domain)

        if self._repo.get(domain).get(key) is None:
            return None

        return self._repo.get(domain)[key]


def create_node(spec_id, id, name):
    spec = repository().get("nodespec", spec_id)

    if spec is None:
        raise Exception("No such node specification {}".format(spec_id))

    try:
        spec_obj = json.loads(spec, strict=False)
    except Exception as e:
        raise Exception("Invalid node specification {}".format(spec))

    anode = node(id, name, spec_obj)
    return anode

# Run a flow based on a defined specification of flow
# Todo consider unify the flow definition spec and running spec


def run_flow(flow_spec):
    print flow_spec
    try:
        flow_spec_obj = json.loads(flow_spec, strict=False)
    except Exception as e:
        # print "invalid flow specification format"
        raise e

    aflow = flow(flow_spec_obj.get("id"), flow_spec_obj.get("name"))

    for node_def in flow_spec_obj.get("nodes"):
        print node_def.get("spec_id")
        print node_def.get("id")
        print node_def.get("name")

        anode = create_node(node_def.get("spec_id"),
                            node_def.get("id"), node_def.get("name"))
        aflow.add_node(anode)
        if "is_end" in node_def.keys() and node_def.get("is_end") == 1:
            end_node = anode
        for port_def in node_def.get("ports"):
            anode.set_inport_value(port_def.get("name"), port_def.get("value"))

    for link_def in flow_spec_obj.get("links"):
        source = link_def.get("source").split(":")
        target = link_def.get("target").split(":")

        aflow.link(source[0], source[1], target[0], target[1])

    aflow.run(end_node)

    # Build flow running result which contains all the output port values
    result = []
    for node in aflow.get_nodes():
        node_result = {}
        node_result["id"] = node.id
        out_values = []
        out_ports = node.get_ports("out")
        for out_port in out_ports:
            out_value = {}
            out_value["name"] = out_port.name
            try:
                value = node.get_outport_value(out_port.name)
            except Exception as e:
                value = ''
            out_value["value"] = node.get_outport_value(out_port.name)
            out_values.append(out_value)
        node_result["ports"] = out_values
        result.append(node_result)

    return result
