# PyFlow
a python based flow programming engine/platform

# Build and Test
## Run locally
`cd /src`
`python server.py`
then open `http://localhost:5000` for the pyflow web UI

## Run with docker
`docker run -P naughtytao/pyflow:latest`
## Docker Build and Run
`cd /docker`
`make docker`
then run `docker run -P pyflow:latest` to run the pyflow in docker  
## Unit Test
`cd /tests/unit`
`python xxx.py`
## Rest Test
`cd /tests/rest`
`resttest.py http://localhost:5000 test.yaml --verbose`