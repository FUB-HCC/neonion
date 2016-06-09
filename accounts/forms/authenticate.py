from django import forms
from django.contrib.auth import authenticate


class AuthenticationForm(forms.Form):
    """
    Login form
    """
<<<<<<< HEAD
    email = forms.EmailField(label='Email',
                             max_length=80,
                             widget=forms.TextInput(
                                 attrs={'class': 'form-control', 'data-h5-errorid': 'invalid_email', 'required': ''}))
=======
    username = forms.CharField(label='User',
                             max_length=80,
                             widget=forms.TextInput(
                                 attrs={'class': 'form-control', 'data-h5-errorid': 'invalid_username', 'required': ''}))
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8

    password = forms.CharField(label='Password',
                               widget=forms.PasswordInput(attrs={'class': 'form-control', 'required': ''}))

    def clean(self):
        # print( self.cleaned_data )
<<<<<<< HEAD
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')
        user = authenticate(email=email, password=password)
=======
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        
        user = authenticate(username=username, password=password)
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8
        if not user:
            raise forms.ValidationError("Sorry, that login was invalid. Please try again.")
        elif not user.is_active:
            raise forms.ValidationError("An administrator must approve this request before you can login.")
        return self.cleaned_data

    class Meta:
<<<<<<< HEAD
        fields = ['email', 'password']
=======
        fields = ['username', 'password']
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8
