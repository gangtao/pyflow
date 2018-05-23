"""Node Class for Flow."""

import traceback, pdb

from port import Inport, Outport

OUTPORT_DEFAULT_NAME = "out"


class Node(object):

    def __init__(self, id, name, spec):
        self._id = id
        self._name = name
        self._spec = spec
        self._port_spec = spec.get("port")
        # Tricky and Non-Secure eval
        exec(spec.get("func"))
        self._func = func

        self._inputports = dict()
        self._outputports = dict()
        self._initports()
        self._is_cache_valid = False
        self._status = "init"
        self._error = None

    @property
    def name(self):
        return self._name

    @property
    def id(self):
        return self._id

    def _initports(self):

        def _parse_in_port_port_spec(port_port_spec):
            name = port_port_spec.get("name")

            ptype = port_port_spec.get("type")
            if ptype is None:
                ptype = "String"

            default = port_port_spec.get("default")

            required = port_port_spec.get("required")
            if required is None:
                required = False
            else:
                required = required.lower() in ('1', 'true', 'yes', 'y')

            try:
                order = int(port_port_spec.get("order"))
            except Exception as e:
                order = 0

            return [name, ptype, default, required, order]

        def _parse_out_port_port_spec(port_port_spec):
            name = port_port_spec.get("name")

            ptype = port_port_spec.get("type")
            if ptype is None:
                ptype = "String"

            return [name, ptype]

        input_ports = self._port_spec.get("input")
        if input_ports:
            for p in input_ports:
                port_info = _parse_in_port_port_spec(p)
                in_port = Inport(port_info[0], port_info[1], port_info[
                                 2], port_info[3], port_info[4])
                self._inputports[in_port.name] = in_port

        output_ports = self._port_spec.get("output")

        if output_ports is None:
            out_port = Outport(OUTPORT_DEFAULT_NAME)
            self._outputports[out_port.name] = out_port
        else:
            for p in output_ports:
                port_info = _parse_out_port_port_spec(p)
                out_port = Outport(port_info[0], port_info[1])
                self._outputports[out_port.name] = out_port

    def __str__(self):
        out_str = "node id : {}\nnode name : {}".format(self._id, self._name)

        for k, v in self._inputports.items():
            out_str = out_str + "\n" + str(v)

        for k, v in self._outputports.items():
            out_str = out_str + "\n" + str(v)

        out_str = out_str + "\n" + "status : {}".format(self._status)
        out_str = out_str + "\n" + "error : {}".format(self._error)

        return out_str

    def set_inport_value(self, port_name, value):
        inport = self._inputports.get(port_name)
        if inport is None:
            raise Exception("No such port {} in current Node {}".format(
                port_name, self.id))  # TODO Add Exception definition for Flow

        inport.value = value  # TODO cache later
        self._is_cache_valid = False

    def get_port(self, port_name, port_type):
        if port_type == "in":
            return self._inputports.get(port_name)
        elif port_type == "out":
            return self._outputports.get(port_name)
        else:
            raise Exception("Invalid port type {}".format(port_type))

    def get_ports(self, port_type):
        if port_type == "in":
            return [v for k, v in self._inputports.items()]
        elif port_type == "out":
            return [v for k, v in self._outputports.items()]
        else:
            raise Exception("Invalid port type {}".format(port_type))

    def get_inport_value(self, port_name):
        inport = self._inputports.get(port_name)

        if inport is None:
            raise Exception("No such port {} in current Node {}".format(
                port_name, self.id))  # TODO Add Exception definition for Flow

        return inport.value

    def get_outport_value(self, port_name=OUTPORT_DEFAULT_NAME):
        outport = self._outputports.get(port_name)

        if outport is None:
            raise Exception("No such port {} in current Node {}".format(
                port_name, self.id))  # TODO Add Exception definition for Flow

        return outport.value

    def get_node_value(self):
        node = dict()
        node["id"] = self._id
        node["name"] = self._name
        node["inputs"] = [v.get_value() for k, v in self._inputports.items()]
        node["outputs"] = [v.get_value() for k, v in self._outputports.items()]
        node["status"] = self._status

        node["error"] = str(self._error)
        return node

    def run(self):
        def _function_wrapper(func, args):
            return func(*args)

        self._status = "running"

        if self._is_cache_valid:
            # Cache Hit
            self._status = "sucess"
            self._error = None
            return

        parameter_values = [(v.value, v.order)
                            for k, v in self._inputports.items()]

        parameter_values = [v[0] for v in sorted(
            parameter_values, key=lambda x: x[1])]  # sort by order
        
        try:
            return_value = _function_wrapper(self._func, parameter_values)

            self._is_cache_valid = True
            self._status = "sucess"
            self._error = None

            # Single output case
            if OUTPORT_DEFAULT_NAME in self._outputports.keys() and len(self._outputports) == 1:
                out_port = self._outputports.get(OUTPORT_DEFAULT_NAME)
                out_port.value = return_value
                return

            # Mutiple output case
            # the multiple output should return a dict where key/value is output name/value
            for k, v in self._outputports.items():
                v.value = return_value.get(k)
        except Exception as e:
            self._status = "fail"
            self._error = e
            print(traceback.format_exc())
