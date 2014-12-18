# Install on Ubuntu

For neonion you need python with django installed. 
For storing the annotations we use the elasticsearch based annotator-store, semantic content is stored in sesame.

## Get neonion
```
git clone git@github.com:FUB-HCC/neonion.git
```

## Install Dependencies

### Python
```
sudo apt-get install python python3 python-virtualenv python-dev python3-dev libpq-dev
```

### Annotator Store
```
git clone https://github.com/openannotation/annotator-store.git
```

### Java 1.7
```
sudo apt-add-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java7-installer
```

### Elasticsearch
```
wget -qO - http://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -
sudo echo "deb http://packages.elasticsearch.org/elasticsearch/1.3/debian stable main" >> /etc/apt/sources.list
sudo apt-get update
sudo apt-get install elasticsearch
```

### Tomcat
```
sudo apt-get install tomcat7 tomcat7-admin
```

### Sesame
Download SDK file from http://sourceforge.net/projects/sesame/files/Sesame%202/

```
tar xzfv openrdf-sesame-2.7.13-sdk.tar.gz
```

## Start Services

### Elasticsearch
```
sudo /etc/init.d/elasticsearch start
```

### Tomcat and Sesame
First you need to add an admin user to your tomcat-config (should be found at /var/lib/tomcat7/conf/tomcat-users.xml) 
Please change this default-settings according to your setup.
 
```
<?xml version='1.0' encoding='utf-8'?>
<tomcat-users>
  <role rolename="manager-gui"/>
  <role rolename="tomcat"/>
  <role rolename="role1"/>
  <user username="tomcat" password="tomcat" roles="manager-gui"/>
  <user username="both" password="tomcat" roles="tomcat,role1"/>
  <user username="role1" password="tomcat" roles="role1"/>
 
</tomcat-users>
```

Now we are ready to start tomcat

```
sudo /etc/init.d/tomcat7 start
```

To deploy Sesame to your tomcat go to http://localhost:8080/manager/html and upload the files *openrdf-sesame.war* and *openrdf-workbench.war'*.


### create virtualenv and install python requirements
```
virtualenv -p /usr/bin/python2.7 venv2.7
source venv2.7/bin/activate
pip install -r neonion/requirements.txt
```

### start Annotator Store (in a separate shell)
```
source venv2.7/bin/activate
cd annotator-store
cp annotator.cfg.example annotator.cfg
python run.py
```

## start neonion (in a separate shell)
```
source venv2.7/bin/activate
cd neonion
python manage.py syncdb
python manage.py runserver 0.0.0.0:8000
```