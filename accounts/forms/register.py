from django import forms
from accounts.models import User
from django.contrib.auth import get_user_model


class RegistrationForm(forms.ModelForm):
    """
    Form for registering a new account.
    """
    email = forms.EmailField(widget=forms.EmailInput(
        attrs={
            'placeholder': 'john.doe@example.com',
            'class': 'width-100',
        }),
        label='Email')

    name = forms.CharField( widget=forms.TextInput(
        attrs={
            'placeholder': 'John',
            'class': 'width-50',
        }
        ),
        label='Name')


    surname = forms.CharField( widget=forms.TextInput(
        attrs={
            'placeholder': 'Doe',
            'class': 'width-50',
        }
        ),
        label='Surname')

    password1 = forms.CharField(widget=forms.PasswordInput(
        attrs={
            'placeholder': '********',
            'class': 'width-100',
        }),
        label='Password')

    password2 = forms.CharField(widget=forms.PasswordInput(
        attrs={
            'placeholder': '********',
            'class': 'width-100',
        }),
        label='Password(again)')


    class Meta:
        model = User
        fields = ['email', 'name', 'surname', 'password1', 'password2']

    def clean(self):
        """
        Verifies that the values entered into the password fields match

        NOTE: Errors here will appear in ``non_field_errors()`` because it applies to more than one field.
        """
        cleaned_data = super(RegistrationForm, self).clean()
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError("Passwords don't match. Please enter both fields again.")
        return self.cleaned_data

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user
