FROM ubuntu:14.04

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install python2.7 python2.7-dev python-pip git

ENV BASEDIR /src
ENV CODEDIR $BASEDIR/code
WORKDIR $CODEDIR

RUN git clone https://github.com/openannotation/annotator-store.git .
RUN pip install -e .[flask]

COPY ./annotator.cfg annotator.cfg
COPY ./run.py run.py

# CMD python run.py
