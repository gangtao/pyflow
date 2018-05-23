"""Port Class for Flow."""

import types
import json

# All Supported Types
TYPES = dict()
TYPES["Boolean"] = types.BooleanType
TYPES["Int"] = types.IntType
TYPES["Long"] = types.LongType
TYPES["Float"] = types.FloatType
TYPES["String"] = types.StringType
TYPES["List"] = types.ListType
TYPES["Json"] = types.DictType


def c_int(val):
    return int(val)


def c_bool(val):
    if type(val) is 'bool':
        return val
    elif type(val) is str or unicode:
        return str(val).lower() in ["y", "true", "yes"]
    else:
        return False


def c_long(val):
    return long(val)


def c_float(val):
    return float(val)


def c_str(val):
    return str(val)


def c_list(val):
    if type(val) is list:
        return val
    elif type(val) is str or unicode:
        return str(val).split(",")
    return []


def c_json(val):
    if type(val) is dict:
        return val
    elif type(val) is str or unicode:
        return json.loads(str(val))
    return {}


def type_conversion(value, type):
    if type == "Boolean":
        return c_bool(value)
    elif type == "Int":
        return c_int(value)
    elif type == "Long":
        return c_long(value)
    elif type == "Float":
        return c_float(value)
    elif type == "String":
        return c_str(value)
    elif type == "List":
        return c_list(value)
    elif type == "Json":
        return c_json(value)
    else:
        return None


class Port(object):
    def __init__(self, name, type='String'):
        self._name = name
        self._type = type
        if type in TYPES.keys():
            self._type_object = TYPES[type]
        else:
            print("Port type {} is not supported! default to string".format(type))
            self._type_object = 'String'
        self._value = None

    @classmethod
    def support_types(cls):
        return TYPES.keys()

    @property
    def name(self):
        return self._name

    @property
    def type(self):
        return self._type

    @property
    def type_object(self):
        return self._type_object

    @property
    def value(self):
        # convert the value to type
        return type_conversion(self._value, self._type)

    @value.setter
    def value(self, value):
        self._value = value

    def __str__(self):
        format_str = "Port\nname : {}\nvalue : {}\ntype : {}\n"
        return format_str.format(self.name, str(self.value), self.type)

    def get_value(self):
        port = dict()
        port["name"] = self._name
        port["value"] = self._value
        port["type"] = self._type
        return port

    def valid(self, value):
        # TODO Type check
        pass

    def clone(self, include_value=False):
        # TODO implement clone of port
        pass


class Inport(Port):

    def __init__(self, name, type='String', default=None, required=False, order=0):
        Port.__init__(self, name, type)
        self._default = default
        self._required = required
        self._order = order
        self._point_from = None

    @property
    def default(self):
        return self._default

    @property
    def is_required(self):
        return self._required

    @property
    def order(self):
        return self._order

    @property
    def value(self):
        if self._value is not None:
            # return converted value according to the type def
            return type_conversion(self._value, self._type)
        else:
            return self._default

    @value.setter
    def value(self, value):
        self._value = value

    def point_from(self, port):
        self._point_from = port

    def __str__(self):
        format_str = "In" + \
            Port.__str__(self) + "default : {}\required : {}\norder : {}\n"
        return format_str.format(self.default, self.is_required, self.order)


class Outport(Port):
    def __init__(self, name, type='String'):
        Port.__init__(self, name, type)
        self._point_to = []

    @property
    def value(self):
        # return converted value according to the type def
        return type_conversion(self._value, self._type)

    @value.setter
    def value(self, value):
        self._value = value
        for p in self._point_to:
            p.value = value

    def point_to(self, port):
        self._point_to.append(port)

    def un_point_to(self, port):
        self._point_to.remove(port)

    def __str__(self):
        format_str = "Out" + Port.__str__(self)
        return format_str
