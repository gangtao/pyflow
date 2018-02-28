import unittest
import sys
import json

sys.path.append('../../src')

from fbp import create_node, run_flow
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


class TestFBPRunner(unittest.TestCase):

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

    def test_run1(self):
        # A sample flow definition
        flow_spec = '''
      {
          "id": "my.test.spec",
          "name": "test flow",
          "nodes": [
              {
                  "spec_id": "flow.cli",
                  "id": "myflow.cli",
                  "name": "cli",
                  "ports": [
                      {
                          "name": "command",
                          "value": "iostat"
                      }
                  ]
              },
              {
                  "spec_id": "flow.line_breaker",
                  "id": "myflow.line_breaker",
                  "name": "line_breaker",
                  "ports": [],
                  "is_end": 1
              }
          ],
          "links": [
              {
                  "source": "myflow.cli:out",
                  "target": "myflow.line_breaker:input"
              }
          ]
      }
      '''

        print json.dumps(run_flow(flow_spec))
        print "\n"

    def test_run2(self):
        # A sample flow definition
        flow_spec = '''{"id":"flowbuilder.gen","name":"BuilderSample","nodes":[{"id":"node1419317316499","spec_id":"flow.cli","name":"cli","ports":[{"name":"command","value":"iostat"}],"is_end":1}],"links":[]}
      '''

        print json.dumps(run_flow(flow_spec))
        print "\n"

    def test_run3(self):
        # A sample flow definition with failure command
        flow_spec = '''{"id":"flowbuilder.gen","name":"BuilderSample","nodes":[{"id":"node1419317316499","spec_id":"flow.cli","name":"cli","ports":[{"name":"command","value":"ls"}],"is_end":1}],"links":[]}
      '''

        print json.dumps(run_flow(flow_spec))
        print "\n"


if __name__ == '__main__':
    unittest.main()
