import unittest

import sys

sys.path.append('../../src')

from fbp import create_node
from fbp.repository import repository
from fbp.node import node
from fbp.flow import flow

from main import init


class TestFBPRepository(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        init()

    @classmethod
    def tearDownClass(cls):
        pass

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_respository1(self):
        repo = repository()

        anode = create_node("flow.cli", "myflow.command", "command")
        bnode = create_node("flow.line_breaker",
                            "myflow.breaker", "breaker")

        aflow = flow("my.test.aflow", "A flow test")
        aflow.add_node(anode)
        aflow.add_node(bnode)

        aflow.link(anode.id, "out", bnode.id, "input")
        anode.set_inport_value("command", "iostat")

        aflow.run(bnode)

        print bnode.get_outport_value()

    #@unittest.skip("")
    def test_respository2(self):
        repo = repository()

        anode = create_node("flow.rest", "myflow.rest", "rest")

        aflow = flow("my.test.aflow", "A flow test")
        aflow.add_node(anode)

        anode.set_inport_value("url", "https://api.github.com/events")

        aflow.run(anode)

        print anode.get_outport_value('json')


if __name__ == '__main__':
    unittest.main()
