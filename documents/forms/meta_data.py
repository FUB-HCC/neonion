from django import forms

class MetaDataForm(forms.Form):

    """
    Meta-Data Form in Import
    """
    creator = forms.CharField(label="creator")
    type = forms.CharField(label="type")
    contributor = forms.CharField(label="contributor")
    coverage = forms.CharField(label="coverage")
    date = forms.DateField(label="date")
    description = forms.CharField(label="description")
    format = forms.CharField(label="format")
    identifier = forms.CharField(label="identifier")
    language = forms.CharField(label="language")
    publisher = forms.CharField(label="publisher")
    relation = forms.CharField(label="relation")
    rights = forms.CharField(label="rights")
    source = forms.CharField(label="source")
    subject = forms.CharField(label="subject")
    created = forms.DateField(label="created")
    updated = forms.DateField(label="updated")
