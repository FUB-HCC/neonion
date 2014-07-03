h1 Startup

h3 Loomp
(1) Zu Loomp Ordner navigieren
(2) Joseki starten
	sh joseki/start-endpoint.sh 
(3) Loomp starten
	export PATH=/Users/administrator/grails/grails-2.3.7/bin/:$PATH
	sh ru.sh

h3 Annotator
(1) VirtualEnv aktivieren
	source /Users/administrator/virtualenv/django/bin/activate
(2) Zu Neon Ordner navigieren
(3) Annotator starten
	python manage.py runserver 9090

VirtualEnv requirements:
Python 3.4.0
Django==1.6.4
django-jquery==1.9.1
django-twitter-bootstrap==3.1.1