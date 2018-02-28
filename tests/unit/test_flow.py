import unittest

import sys
import json
import time

sys.path.append('../../src')

import fbp
from fbp.port import Inport, Outport
from fbp.node import Node
from fbp.flow import Flow


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
        aflow = Flow("my.test.aflow", "A flow test")

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

        node1 = Node("my.test.node1", "node1", spec_obj)
        node2 = Node("my.test.node2", "node2", spec_obj)

        aflow.add_node(node1)
        aflow.add_node(node2)

        aflow.link(node1.id, "out", node2.id, "port2")

        node1.set_inport_value("port1", "A")
        node1.set_inport_value("port2", "B")
        node2.set_inport_value("port1", "C")

        stats = aflow.run(node2)

        while not stats.check_stat():
            time.sleep(0.1)

        result = stats.get_result_by_id("my.test.node2")
        self.assertEqual(result["outputs"][0]["value"], "CAB")

    def test_flow_3nodes(self):
        aflow = Flow("my.test.aflow", "A flow test")

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

        node1 = Node("my.test.node1", "node1", spec_obj)
        node2 = Node("my.test.node2", "node1", spec_obj)
        node3 = Node("my.test.node3", "node3", spec_obj)

        aflow.add_node(node1)
        aflow.add_node(node2)
        aflow.add_node(node3)

        aflow.link(node1.id, "out", node3.id, "port1")
        aflow.link(node2.id, "out", node3.id, "port2")

        node1.set_inport_value("port1", "A")
        node1.set_inport_value("port2", "B")
        node2.set_inport_value("port1", "C")
        node2.set_inport_value("port2", "D")

        stats = aflow.run(node3)

        while not stats.check_stat():
            time.sleep(0.1)

        result = stats.get_result_by_id("my.test.node3")
        self.assertEqual(result["outputs"][0]["value"], "ABCD")

    def test_flow_4nodes(self):
        aflow = Flow("my.test.aflow", "A flow test")

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

        node1 = Node("my.test.node1", "node1", spec_obj)
        node2 = Node("my.test.node2", "node1", spec_obj)
        node3 = Node("my.test.node3", "node3", spec_obj)
        node4 = Node("my.test.node4", "node4", spec_obj)

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

        stats3 = aflow.run(node3)
        stats4 = aflow.run(node4)

        while not stats3.check_stat() or not stats4.check_stat():
            time.sleep(0.1)

        result3 = stats3.get_result_by_id("my.test.node3")
        self.assertEqual(result3["outputs"][0]["value"], "ABCD")
        result4 = stats4.get_result_by_id("my.test.node4")
        self.assertEqual(result4["outputs"][0]["value"], "CDE")


if __name__ == '__main__':
    unittest.main()
