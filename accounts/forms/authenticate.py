from django import forms
from django.contrib.auth import authenticate


class AuthenticationForm(forms.Form):
    """
    Login form
    """
    username = forms.CharField(label='User',
                             max_length=80,
                             widget=forms.TextInput(
                                 attrs={'class': 'form-control', 'data-h5-errorid': 'invalid_username', 'required': ''}))

    password = forms.CharField(label='Password',
                               widget=forms.PasswordInput(attrs={'class': 'form-control', 'required': ''}))

    def clean(self):
        # print( self.cleaned_data )
        username = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        
        user = authenticate(username=username, password=password)
        if not user:
            raise forms.ValidationError("Sorry, that login was invalid. Please try again.")
        elif not user.is_active:
            raise forms.ValidationError("An administrator must approve this request before you can login.")
        return self.cleaned_data

    class Meta:
        fields = ['username', 'password']
