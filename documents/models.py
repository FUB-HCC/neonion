from django.db import models

class Document():
    urn 	= models.CharField( 'urn', unique=True, db_index=True )
    name 	= models.CharField( 'name' )
    content = models.TextField( 'content' )

    def __unicode__(self):
        return self.urn