# PyFlow
PyFlow is a python based flow programming engine/platform

According to wikipedia, here is the definition of [FBP](http://www.jpaulmorrison.com/fbp/)

> In computer programming, flow-based programming (FBP) is a programming paradigm that defines applications as networks of "black box" processes, which exchange data across predefined connections by message passing, where the connections are specified externally to the processes. These black box processes can be reconnected endlessly to form different applications without having to be changed internally. FBP is thus naturally component-oriented.

There are lots of software or tools or product that has flow concept for example:
- [Apache NiFi](https://nifi.apache.org/) 
- [DAG](https://data-flair.training/blogs/dag-in-apache-spark/) in spark
- [AWS Step Functions](https://aws.amazon.com/step-functions/)
- [Azure ML Studio](https://studio.azureml.net/)

I am building this tools to help you visualize your function building and execution procedure.


# Concept
Core concept of the PyFlow includs `Node`, `Port`, `Flow` and `Repository`

### Node and Port
### Flow
### Repository


# Flow Engine 


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
python xxx.py
```

## Rest Test
start the pyflow server and then run following command to test the rest API
```
cd /tests/rest
resttest.py http://localhost:5000 test.yaml --verbose
```