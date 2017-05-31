import unittest
import sys
import json

sys.path.append('../../src')

from fbp import repository, create_node, run_flow
from main import init


class TestFBPRunner(unittest.TestCase):

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
        flow_spec = '''{"id":"flowbuilder.gen","name":"BuilderSample","nodes":[{"id":"node1419317316499","spec_id":"flow.cli","name":"cli","ports":[{"name":"command","value":"dir"}],"is_end":1}],"links":[]}
      '''

        print json.dumps(run_flow(flow_spec))
        print "\n"

if __name__ == '__main__':
    unittest.main()
