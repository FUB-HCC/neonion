from django import forms
from accounts.models import User
from django.contrib.auth import get_user_model


class RegistrationForm(forms.ModelForm):
    """
    Form for registering a new account.
    """

    email = forms.EmailField(label='Email', max_length=80, widget=forms.TextInput(attrs={'class': 'h5-email', 'data-h5-errorid': 'invalid_email', 'required':''}))

    password = forms.CharField(label='Password', widget=forms.PasswordInput(attrs={'required':''}))

    class Meta:
        model = User
        fields = ['email', 'password']

    def clean(self):
        cleaned_data = super(RegistrationForm, self).clean()
        mail = cleaned_data.get('email', '')
        password = cleaned_data.get('password', '')

        return self.cleaned_data

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user
