# neonion

neonion is a user-centered, web application for the collaborative annotation of texts developed at the Human-Centered Computing group at Freie Universität Berlin.

neonion supports semantic annotations and open standards but does not presuppose any knowledge about the technologies involved. It is the perfect fit for people who want their annotations to be exchangeable between different tools and projects. Moreover, your annotations can be connected to the linked data cloud.

### Usage
See [https://github.com/FUB-HCC/neonion/wiki/Getting-Started](https://github.com/FUB-HCC/neonion/wiki/Getting-Started)

## Installation

### Get neonion
```
git clone git@github.com:FUB-HCC/neonion.git
```

### Dependencies

For neonion you need Python with Django installed. 
For storing the annotations we use the elasticsearch based annotator-store, semantic content is stored in Sesame.

#### Python 2.7
```
sudo apt-get install python python-virtualenv python-dev libpq-dev
```

#### Annotator Store
```
git clone https://github.com/openannotation/annotator-store.git
```

#### Java 1.7
```
sudo apt-add-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java7-installer
```

#### Elasticsearch 1.3
```
wget -qO - http://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -
sudo echo "deb http://packages.elasticsearch.org/elasticsearch/1.3/debian stable main" >> /etc/apt/sources.list
sudo apt-get update
sudo apt-get install elasticsearch
```

#### Tomcat 7
```
sudo apt-get install tomcat7 tomcat7-admin
```

#### Sesame 2.7.13
Download SDK file from http://sourceforge.net/projects/sesame/files/Sesame%202/

```
tar xzfv openrdf-sesame-2.7.13-sdk.tar.gz
```

### Setup neonion

#### Accounts
By default there are two predefined accounts 'neonion-admin@fu-berlin.de' and 'neonion-test@fu-berlin.de'. Both have the default password 'neonion' but different rights.

```
python manage.py loaddata initial_accounts
```

#### Annotation set for annotating persons
```
python manage.py loadadata initial_annotationsts
```

### Start services

#### Elasticsearch
```
sudo /etc/init.d/elasticsearch start
```

#### Tomcat and Sesame
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


#### Create virtualenv and install python requirements
```
virtualenv -p /usr/bin/python2.7 venv2.7
source venv2.7/bin/activate
pip install -r neonion/requirements.txt
```

#### Start Annotator Store (in a separate shell)
```
source venv2.7/bin/activate
cd annotator-store
cp annotator.cfg.example annotator.cfg
python run.py
```

#### Start neonion (in a separate shell)
```
source venv2.7/bin/activate
cd neonion
python manage.py syncdb
python manage.py runserver 0.0.0.0:8000
```

### Import person data from wikidata into your knowledge base
```
python /PATH/TO/NEONION/common/knowledge/wikidata/wd_import.py --folder /PATH/TO/NEONION/elasticsearch/wikidata
```
