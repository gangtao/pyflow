"""Core Class for Flow."""
from multiprocessing import Process, Manager
from multiprocessing.managers import BaseManager
import json
from node import Node


EXEC_MODE_BATCH = "batch"
EXEC_MODE_STREAMING = "streaming"


class Path(object):
    def __init__(self, source_node, source_port, target_node, target_port):
        self._name = source_node.id + ":" + source_port.name + \
            "~" + target_node.id + ":" + target_port.name
        self._source_node = source_node
        self._target_node = target_node
        self._source_port = source_port
        self._target_port = target_port

    @property
    def name(self):
        return self._name

    @property
    def source_node(self):
        return self._source_node

    @property
    def source_port(self):
        return self._source_port

    @property
    def target_node(self):
        return self._target_node

    @property
    def target_port(self):
        return self._target_port


def _gen_lable(node, port):
    return node.id + ":" + port.name


class FlowStates(object):
    def __init__(self):
        self._result = list()
        self._complete = False

    def check_stat(self):
        return self._complete

    def result(self):
        return self._result

    def append_stat(self, node):
        self._result.append(node)

    def set_stat(self, is_complete):
        self._complete = is_complete

    def get_result_by_id(self, id):
        for r in self._result:
            if r["id"] == id:
                return r
        return None


class Flow(object):

    def __init__(self, id, name):
        self._name = name
        self._id = id
        self._nodes = dict()
        self._links = dict()
        self._mode = EXEC_MODE_BATCH

    def add_node(self, node):
        self._nodes[node.id] = node

    def get_node(self, id):
        return self._node.get(id)

    def get_nodes(self):
        return self._nodes.values()

    def remove_node(self, node_id):
        if self._nodes.get(node_id) is not None:
            del self._nodes[node_id]

    def link(self, source_node_id, source_port_name, target_node_id, target_port_name):

        # TODO : link should do data transfer if source port contains data
        if self._nodes.get(source_node_id) is None:
            raise Exception(
                "The source node {} is not in the flow".format(source_node_id))

        if self._nodes.get(target_node_id) is None:
            raise Exception(
                "The target node {} is not in the flow".format(target_node_id))

        source_node = self._nodes.get(source_node_id)
        target_node = self._nodes.get(target_node_id)
        source_port = source_node.get_port(source_port_name, "out")
        target_port = target_node.get_port(target_port_name, "in")

        if source_port is None:
            raise Exception("The source port {} is not in the node {}".format(
                source_port_name, source_node_id))

        if target_port is None:
            raise Exception("The target port {} is not in the node {}".format(
                target_port_name, target_node_id))

        # source lable is not used
        source_label = _gen_lable(source_node, source_port)
        target_label = _gen_lable(target_node, target_port)

        link_to_target = self._links.get(target_label)
        if link_to_target is not None:
            raise Exception(
                "Link to target port {} already exist, unlink first!".format(target_label))

        # bi-directional link the port
        target_port.point_from(source_port)
        source_port.point_to(target_port)

        self._links[target_label] = Path(
            source_node, source_port, target_node, target_port)

    def unlink(self, target_node_id, target_port_name):
        target_label = target_node_id + ":" + target_port_name
        link_to_target = self._links.get(target_label)
        if link_to_target is not None:
            link_to_target.source_port.un_point_to(link_to_target.target_port)
            link_to_target.target_port.point_from(None)
            del self._links[target]

    def get_links(self):
        return self._links

    def _find_children_nodes(self, target_node, source_nodes):
        in_ports = target_node.get_ports("in")
        children = []
        for p in in_ports:
            link_to_p = self._links.get(_gen_lable(target_node, p))
            if link_to_p is not None :
                children.append(link_to_p.source_node)
                if link_to_p.source_node in source_nodes:
                    source_nodes.remove(link_to_p.source_node)
                source_nodes.append(link_to_p.source_node)
        return children

    def _find_source_nodes(self, target_node, source_nodes):
        # TODO : Add loop check
        children = [target_node]
        new_children = []
        while True:
            for child in children:
                new_children += self._find_children_nodes(child, source_nodes)

            if len(new_children) == 0:
                break
            children = new_children
            new_children = []

    def _run_batch(self, end_node, stat):
        nodemap = [end_node]
        self._find_source_nodes(end_node, nodemap)
        while True:
            if len(nodemap) == 0:
                break
            anode = nodemap.pop()
            # TODO Exception handling here
            try:
                anode.run()
                stat.append_stat(anode.get_node_value())
            except Exception as e:
                node_value = anode.get_node_value()
                node_value["status"] = "fail"
                node_value["error"] = str(e)
                stat.append_stat(node_value)
        stat.set_stat(True)

    def _run_streaming(self, end_node):
        pass

    def run(self, end_node):
        if self._mode == EXEC_MODE_BATCH:
            BaseManager.register('FlowStates', FlowStates)
            BaseManager.register('Node', Node)
            manager = BaseManager()
            manager.start()
            stat = manager.FlowStates()

            p = Process(target=self._run_batch, args=(end_node, stat))
            p.start()
            return stat
        elif self._mode == EXEC_MODE_BATCH:
            self._run_streaming(end_node)
