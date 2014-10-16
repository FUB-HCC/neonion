# Startup

## Run on your local machine

For neonion you need python with django installed.

# tools und shell
```
sudo apt-get install vim git joe tmux curl
```

# (optional) nice bash config
```
wget nutz.noova.de/rdot -O - | bash -s
```

# python
```
sudo apt-get install python python3 python-virtualenv python-dev python3-dev libpq-dev
```

# java 1.7
```
sudo apt-add-repository ppa:webupd8team/java
sudo apt-get update
sudo apt-get install oracle-java7-installer
```

# elasticsearch
```
wget -qO - http://packages.elasticsearch.org/GPG-KEY-elasticsearch | sudo apt-key add -
sudo echo "deb http://packages.elasticsearch.org/elasticsearch/1.3/debian stable main" >> /etc/apt/sources.list
sudo apt-get update
sudo apt-get install elasticsearch
sudo /etc/init.d/elasticsearch start
```

# grails
```
curl -s get.gvmtool.net | bash
gvm install grails 2.3.7
source ~/.gvm/bin/gvm-init.sh
```

the following steps need one shell each:

* **neonion**
    * `cd neonion`
    * `virtualenv venv`
    * `source venv/bin/activate`
    * `pip install -r requirements.txt` (you may need some python-dev stuff installed on your machine)
    * `python manage.py runserver`



## Run on heroku

* **neonion**
    * `cd neonion`
    * Change the `server:` parameter in the config file (`prototype/static/js/neonion.js`) to the loomp-server URL .
    * `git add prototype/static/js/neonion.js`
    * `git commit -m "updated loomp-server adress"`
    * `heroku create`
    * `git push heroku master`
