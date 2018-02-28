# PyFlow
PyFlow is a python based flow programming engine/platform

According to wikipedia, here is the definition of [FBP](http://www.jpaulmorrison.com/fbp/)

> In computer programming, flow-based programming (FBP) is a programming paradigm that defines applications as networks of "black box" processes, which exchange data across predefined connections by message passing, where the connections are specified externally to the processes. These black box processes can be reconnected endlessly to form different applications without having to be changed internally. FBP is thus naturally component-oriented.

There are lots of software or tools or product that enbrace the flow concept for example:
- [Apache NiFi](https://nifi.apache.org/) 
- [DAG](https://data-flair.training/blogs/dag-in-apache-spark/) in spark
- [AWS Step Functions](https://aws.amazon.com/step-functions/)
- [Azure ML Studio](https://studio.azureml.net/)
- [TensorBoard](https://www.tensorflow.org/get_started/graph_viz) from Tensorflow
- [Scratch](http://scratched.gse.harvard.edu/) programing language

I am building this tool to help you visualize your function building and execution procedures.


# Concept
Core concept of the PyFlow includs `Node`, `Port`, `Flow` and `Repository`

### Node and Port
Node is the basic building block for flow.
Each node contains:
- a python function that represent the logic of this node
- zero or more input port which defines the input of the function
- 1 or more output port which represent the running result of the function

A nodespec is the scheme or meta data of a node instance. you can create multiple node instance based on specific nodespec, that works like a nodespec is a class and a node instance is an object of that class.

A nodespec contains following information:
- title : the name of this node
- ports : defines input and output port of this node
- func : the python function of this node
- id : unique identifier of the node specifiction

here is a sample of nodespec for a function of add operation:
```
{
	"title": "add",
	"port": {
		"input": [{
			"name": "a",
			"order": 0
		}, {
			"name": "b",
			"order": 1
		}]
	},
	"func": "def func(a, b):\n    return a + b\n",
	"id": "pyflow.transform.add"
}
```

note, each port has a name and for input port, it has an order. so here `a` is the first input for add operation node and `b` is the second input.

### Flow
A flow is a DAG that composed by nodes and links between nodes.
A link can only link the output port of a node to an input of another node.

A flow description contains:
- id : unique id of this flow
- name : display name of this flow
- nodes : the node instance that compose this flow
- links : the links that connect the ports of the nodes

Here is a sample definition of a flow:
```
{
	"id": "pyflow.builder.gen",
	"name": "SampleFlow",
	"nodes": [{
		"id": "node1515719064230",
		"spec_id": "pyflow.transform.add",
		"name": "add",
		"ports": [{
			"name": "a",
			"value": "1"
		}, {
			"name": "b",
			"value": "2"
		}]
	}, {
		"id": "node1515719065769",
		"spec_id": "pyflow.transform.add",
		"name": "add",
		"ports": [{
			"name": "b",
			"value": "3"
		}]
		"is_end": 1
	}],
	"links": [{
		"source": "node1515719064230:out",
		"target": "node1515719065769:a"
	}]
}
```
![sample](https://github.com/gangtao/pyflow/raw/master/docs/sample_add.png)

note, each input port can have input values in case there is no output port connected to it. and if the is_end is true which means this node is the last node to run for a flow.



# Flow Engine 
A simple flow engine is implemented that will scan the the flow, create a stack orderred by the link of the node to make sure running node sequetially according to the dependency of the node.  So the node will no depenency will run first and then the linked nodes to those node that run complete.
This model is a very simple one and has some limitations.
- call `exec(spec.get("func"))` to execute the python function is not secure, considering to support run the function in container
- does not support parallel processing


# Flow Rest API
PyFlow server is a flask based REST server, refer to `tests/rest/test.yaml` for all the support Rest API

# UI and Work Flow
PyFlow Web UI leverages [jsplumb](https://jsplumbtoolkit.com/) to provide flow building and visulaizing functions.  Through this Web UI, the user can:
- create, edit, test, delete nodes
- create, view, run flows
- import/export the repository that contains all the definition of the flows and nodes

# Build and Test
## Run locally
```
cd /src
python server.py
```
then open `http://localhost:5000` for the pyflow web UI

## Run with docker
```
docker run -P naughtytao/pyflow:latest
```

## Docker Build and Run
```
cd /docker
make docker
```
then run `docker run -P pyflow:latest` to run the pyflow in docker  


## Unit Test
```
cd /tests/unit
python -m unittest discover
```

## Rest Test
start the pyflow server and then run following command to test the rest API
```
cd /tests/rest
resttest.py http://localhost:5000 test.yaml --verbose
```

## Open Issues and Todo list

- Now a static execution engine (run once per a node stack) is supported, need to consider how to support streaming engine
- Port type support and validations
- Support running each function as a docker instance instead of python eval which is much more secure and flexible
- UI improvements, lots of things to do