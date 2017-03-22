import fbp
import json

# Data Source

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

# initilize the repository with some node specification


def init():
    repository = fbp.repository()
    repository.register("nodespec", "flow.cli", cli_spec)
    repository.register("nodespec", "flow.rest", rest_spec)
    repository.register(
        "nodespec", "flow.line_breaker", line_breaker_spec)

    return repository.get("nodespec")
