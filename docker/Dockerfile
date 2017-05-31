FROM ubuntu:trusty

ENV PYTHON_VERSION 2.7.13

RUN apt-get update
RUN apt-get install -y tar wget git

# Install nodejs/babel/bower
RUN apt-get install -y node
RUN apt-get install -y npm

# patch to link node to nodejs
RUN sudo rm /usr/sbin/node
RUN sudo ln -s /usr/bin/nodejs /usr/sbin/node

RUN npm install -g bower

RUN sudo apt-get install -y build-essential checkinstall
RUN sudo apt-get install -y libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev

RUN mkdir /home/temp
RUN cd /home/temp \
	&& wget https://www.python.org/ftp/python/$PYTHON_VERSION/Python-$PYTHON_VERSION.tgz \
	&& tar -xvf Python-$PYTHON_VERSION.tgz \
	&& cd Python-$PYTHON_VERSION \
	&& ./configure \
	&& make \
	&& sudo make install

RUN sudo apt-get install -y python-pip

RUN cd /home \
	&& git clone https://github.com/gangtao/pyflow.git

RUN cd /home/pyflow/src \
	&& pip install --target . flask

RUN cd /home/pyflow/src/static \
	&& bower install --allow-root

COPY ./start.sh /
RUN chmod 777 /start.sh
WORKDIR /

EXPOSE 5000

CMD ["/start.sh"]
