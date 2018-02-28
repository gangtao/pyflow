import unittest

import sys
import json

sys.path.append('../../src')

from fbp.node import Node


class TestFBPNode(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pass

    @classmethod
    def tearDownClass(cls):
        pass

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_node(self):
        spec = '''
        {
          "title" : "node_plus",
          "id" : "my.test.node.plus",
          "port" : {
                "input" : [
                    {"name" : "port1", "order" : 0},
                    {"name" : "port2", "order" : 1}
                ]
            },
          "func" : "def func(x,y):
            return x + y"
        }
        '''

        spec_obj = json.loads(spec, strict=False)

        anode = Node("my.test.node1", "node1", spec_obj)

        anode.set_inport_value("port1", "x")
        anode.set_inport_value("port2", "y")
        anode.run()

        self.assertEqual(anode.get_outport_value(), "xy")

        anode.set_inport_value("port1", 1)
        anode.set_inport_value("port2", 2)
        anode.run()

        self.assertEqual(anode.get_outport_value(), 3)

    def test_node_default_value(self):
        spec = '''
        {
            "title" : "node_plus",
            "id" : "my.test.node.plus",
            "port" : {
                "input" : [
                    {"name" : "port1", "order" : 0, "default" : "xyz"},
                    {"name" : "port2", "order" : 1}
                ]
            },
            "func" : "def func(x,y):
                return x + y"
        }
        '''

        spec_obj = json.loads(spec, strict=False)

        anode = Node("my.test.node1", "node1", spec_obj)

        anode.set_inport_value("port2", "y")
        anode.run()

        self.assertEqual(anode.get_outport_value(), "xyzy")

    def test_node_multiple_output(self):
        spec = '''
        {
            "title" : "node_exchange",
            "id" : "my.test.node.exchange",
            "port" : {
                "input" : [
                        {"name" : "port1", "order" : 0},
                        {"name" : "port2", "order" : 1}
                    ],
                    "output" : [
                        {"name" : "out1" },
                        {"name" : "out2" }
                    ]
                },
            "func" : "def func(x,y):
                ret = {}
                ret[\\"out2\\"] = x  ## Using ' or \\" here to avoid JSON decoding error
                ret[\\"out1\\"] = y
                return ret"
        }
        '''

        spec_obj = json.loads(spec, strict=False)

        anode = Node("my.test.node2", "node2", spec_obj)

        anode.set_inport_value("port1", "goto2")
        anode.set_inport_value("port2", "goto1")
        anode.run()

        self.assertEqual(anode.get_outport_value("out1"), "goto1")
        self.assertEqual(anode.get_outport_value("out2"), "goto2")


if __name__ == '__main__':
    unittest.main()
