from django import forms
from django.contrib.auth import authenticate


class AuthenticationForm(forms.Form):
    """
    Login form
    """
    email = forms.EmailField(label='Email', max_length=80, widget=forms.TextInput(attrs={'class': 'h5-email', 'data-h5-errorid': 'invalid_email', 'required':''}))

    password = forms.CharField(label='Password', widget=forms.PasswordInput(attrs={'required':''}))

    def clean(self):
        #print( self.cleaned_data )
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')
        user = authenticate(email=email, password=password)
        if not user:
            raise forms.ValidationError("Sorry, that login was invalid. Please try again.")
        elif not user.is_active:
            raise forms.ValidationError("An administrator must approve this request before you can login.") 
        return self.cleaned_data

    class Meta:
        fields = ['email', 'password']
