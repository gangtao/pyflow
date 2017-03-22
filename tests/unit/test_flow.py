import unittest

import sys
import json

sys.path.append('../../src')

from fbp.port import inport, outport
from fbp.node import node
from fbp.flow import flow


class TestFBPPort(unittest.TestCase):

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

    def test_flow_2nodes(self):
        aflow = flow("my.test.aflow", "A flow test")

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

        node1 = node("my.test.node1", "node1", spec_obj)
        node2 = node("my.test.node2", "node2", spec_obj)

        aflow.add_node(node1)
        aflow.add_node(node2)

        aflow.link(node1.id, "out", node2.id, "port2")

        node1.set_inport_value("port1", "A")
        node1.set_inport_value("port2", "B")
        node2.set_inport_value("port1", "C")

        aflow.run(node2)

        self.assertEqual(node2.get_outport_value(), "CAB")

    def test_flow_3nodes(self):
        aflow = flow("my.test.aflow", "A flow test")

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

        node1 = node("my.test.node1", "node1", spec_obj)
        node2 = node("my.test.node2", "node1", spec_obj)
        node3 = node("my.test.node3", "node3", spec_obj)

        aflow.add_node(node1)
        aflow.add_node(node2)
        aflow.add_node(node3)

        aflow.link(node1.id, "out", node3.id, "port1")
        aflow.link(node2.id, "out", node3.id, "port2")

        node1.set_inport_value("port1", "A")
        node1.set_inport_value("port2", "B")
        node2.set_inport_value("port1", "C")
        node2.set_inport_value("port2", "D")

        aflow.run(node3)

        self.assertEqual(node3.get_outport_value(), "ABCD")

    def test_flow_4nodes(self):
        aflow = flow("my.test.aflow", "A flow test")

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

        node1 = node("my.test.node1", "node1", spec_obj)
        node2 = node("my.test.node2", "node1", spec_obj)
        node3 = node("my.test.node3", "node3", spec_obj)
        node4 = node("my.test.node4", "node4", spec_obj)

        aflow.add_node(node1)
        aflow.add_node(node2)
        aflow.add_node(node3)
        aflow.add_node(node4)

        aflow.link(node1.id, "out", node3.id, "port1")
        aflow.link(node2.id, "out", node3.id, "port2")
        aflow.link(node2.id, "out", node4.id, "port1")

        node1.set_inport_value("port1", "A")
        node1.set_inport_value("port2", "B")
        node2.set_inport_value("port1", "C")
        node2.set_inport_value("port2", "D")
        node4.set_inport_value("port2", "E")

        aflow.run(node3)
        aflow.run(node4)

        self.assertEqual(node3.get_outport_value(), "ABCD")
        self.assertEqual(node4.get_outport_value(), "CDE")

if __name__ == '__main__':
    unittest.main()
