FROM alpine:3.7

ENV PYTHON_VERSION 2.7.13

RUN apk add --update nodejs nodejs-npm

RUN apk add --update \
    python \
    python-dev \
    py-pip \
    build-base \
    nodejs \
    nodejs-npm \
    yarn \
    git \
  && rm -rf /var/cache/apk/*

RUN cd /home \
	&& git clone https://github.com/gangtao/pyflow.git

RUN cd /home/pyflow/src \
	&& pip install --target . flask

RUN cd /home/pyflow/src/static \
	&& yarn install
RUN cd /home/pyflow/src \
	&& pip install --target . flask

COPY ./start.sh /
RUN chmod +x /start.sh

WORKDIR /
EXPOSE 5000

CMD ["/bin/sh","./start.sh"]
