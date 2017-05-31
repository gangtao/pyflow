"""Port Class for Flow."""


class path(object):
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


class flow(object):

    def __init__(self, id, name):
        self._name = name
        self._id = id
        self._nodes = dict()
        self._links = dict()

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

        self._links[target_label] = path(
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

    def _find_source_nodes(self, target_node, source_nodes):
        # TODO : Add loop check
        in_ports = target_node.get_ports("in")
        for p in in_ports:
            link_to_p = self._links.get(_gen_lable(target_node, p))
            if link_to_p is not None and link_to_p.source_node not in source_nodes:
                source_nodes.append(link_to_p.source_node)
                self._find_source_nodes(link_to_p.source_node, source_nodes)

    def run(self, end_node):
        nodemap = [end_node]
        self._find_source_nodes(end_node, nodemap)
        result = list()

        while True:
            if len(nodemap) == 0:
                break
            anode = nodemap.pop()
            anode.run()  # TODO Exception handling here
            result.append(anode)

        return result

    def run_async(self, end_node, result):
        pass
