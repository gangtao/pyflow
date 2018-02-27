"""Port Class for Flow."""


class Port(object):
    def __init__(self, name, type='String'):
        self._name = name
        self._type = type
        self._value = None

    @property
    def name(self):
        return self._name

    @property
    def type(self):
        return self._type

    @property
    def value(self):
        return self._value

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
            return self._value
        else:
            return self._default

    @value.setter
    def value(self, value):
        self._value = value

    def point_from(self, port):
        self._point_from = port

    def __str__(self):
        format_str = "In" + \
            port.__str__(self) + "default : {}\required : {}\norder : {}\n"
        return format_str.format(self.default, self.is_required, self.order)


class Outport(Port):
    def __init__(self, name, type='String'):
        Port.__init__(self, name, type)
        self._point_to = []

    @property
    def value(self):
        return self._value

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
        format_str = "Out" + port.__str__(self)
        return format_str
