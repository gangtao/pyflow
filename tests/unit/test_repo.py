import unittest

import sys
import time

sys.path.append('../../src')

from fbp import create_node
from fbp.flow import Flow
import fbp.repository


# CLI Node Definition
cli_spec = '''
{
    "title" : "cli",
    "id" : "flow.cli",
    "port" : {
            "input" : [
                {"name" : "command", "order" : 0}
            ]
        },
    "func" : "def func(command):\n    import shlex, subprocess\n    ## This cli cannot hand code that refresh the screen like top\n    args = shlex.split(command)\n    p = subprocess.Popen(args, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)\n    outdata, errdata = p.communicate()\n    if len(errdata) != 0:\n        raise Exception('Failed to execut command % , error is {}'.format(command, errdata))\n    return outdata"
}
'''

# Rest Http Get
rest_spec = '''
{
    "title" : "rest",
    "id" : "flow.rest",
    "port" : {
            "input" : [
                {
                    "name" : "url", 
                    "order" : 0
                },
                {
                    "name" : "parameter", 
                    "order" : 1
                },
                {
                    "name" : "header", 
                    "order" : 2
                }
            ],
            "output" : [
                {"name" : "text" },
                {"name" : "json" },
                {"name" : "encoding" }
            ]
        },
    "func" : "def func(url, parameter=None, header=None):\n    import requests\n    paras = {}\n    if parameter is not None:\n        paras['params'] = parameter\n\n    if header is not None:\n        paras['headers'] = header\n\n    r = requests.get(url, **paras)\n\n    ret = {}\n    ret['text'] = r.text\n    ret['json'] = r.json()\n    ret['encoding'] = r.encoding\n\n    return ret"
}
'''

# Data Handling and Trasformation

# Ln Breaker Node Definition

line_breaker_spec = '''
{
    "title" : "line_breaker",
    "id" : "flow.line_breaker",
    "port" : {
        "input": [
            {
                "name": "input",
                "order": 0
            },
            {
                "name": "breaker",
                "order": 1,
                "default": "\\n"
            }
        ]
    },
    "func" : "def func(input, breaker):\n    import re\n    print 'breaker is {}'.format(breaker)\n    print 'input is {}'.format(input)\n    lines = re.split(breaker, input)\n    return lines"
}
'''


class TestFBPRepository(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        repository = fbp.repository()
        repository.register("nodespec", "flow.cli", cli_spec)
        repository.register("nodespec", "flow.rest", rest_spec)
        repository.register(
            "nodespec", "flow.line_breaker", line_breaker_spec)

    @classmethod
    def tearDownClass(cls):
        pass

    def setUp(self):
        pass

    def tearDown(self):
        pass

    #@unittest.skip("")
    def test_respository1(self):
        repo = fbp.repository()

        anode = create_node("flow.cli", "myflow.command", "command")
        bnode = create_node("flow.line_breaker",
                            "myflow.breaker", "breaker")

        aflow = Flow("my.test.aflow", "A flow test")
        aflow.add_node(anode)
        aflow.add_node(bnode)

        aflow.link(anode.id, "out", bnode.id, "input")
        anode.set_inport_value("command", "iostat")

        stats = aflow.run(bnode)
        while not stats.check_stat():
            time.sleep(0.1)

        # print bnode.get_outport_value()
        print repo.domains()

    def test_respository2(self):
        repo = fbp.repository()

        anode = create_node("flow.rest", "myflow.rest", "rest")

        aflow = Flow("my.test.aflow", "A flow test")
        aflow.add_node(anode)

        anode.set_inport_value("url", "https://api.github.com/events")

        stats = aflow.run(anode)
        while not stats.check_stat():
            time.sleep(0.1)

        # print anode.get_outport_value('json')
        print repo.domains()

    #@unittest.skip("")
    def test_respository3(self):
        repo = fbp.repository()
        print repo.dumps("./repo.json")

    #@unittest.skip("")
    def test_respository4(self):
        repo = fbp.repository()
        repo.loads("./repo.json")

        anode = create_node("flow.rest", "myflow.rest", "rest")

        aflow = Flow("my.test.aflow", "A flow test")
        aflow.add_node(anode)

        anode.set_inport_value("url", "https://api.github.com/events")

        stats = aflow.run(anode)
        while not stats.check_stat():
            time.sleep(0.1)

        # print anode.get_outport_value('json')


if __name__ == '__main__':
    unittest.main()
