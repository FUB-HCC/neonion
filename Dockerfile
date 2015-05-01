FROM ubuntu:14.04

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install python2.7 python2.7-dev python-pip
RUN apt-get -y install ruby
RUN gem install sass

# RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV BASEDIR /src
ENV CODEDIR $BASEDIR/code
ENV STATICFILES $CODEDIR/neonion/static/

COPY . $CODEDIR
# bugfix for hardcoded urls
COPY settings/docker.py $CODEDIR/settings/development.py

# install requirements
RUN /usr/bin/pip install -r ${CODEDIR}/requirements.txt

# build css
RUN /usr/local/bin/sass $STATICFILES/stylesheets/main.scss $STATICFILES/css/main.css

# init djang
WORKDIR $CODEDIR
RUN /usr/bin/python manage.py syncdb --noinput
RUN /usr/bin/python manage.py loaddata fixtures/*.json

RUN /usr/bin/python manage.py collectstatic --noinput
