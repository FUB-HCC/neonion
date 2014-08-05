from django import forms
from django.contrib.auth import authenticate


class AuthenticationForm(forms.Form):
    """
    Login form
    """
    email = forms.EmailField(widget=forms.EmailInput(attrs={
                                                        'placeholder':'john.doe@example.com',
                                                        'class': 'width-100',
                                                    }), label="Email")
    password = forms.CharField(widget=forms.PasswordInput(attrs={
                                                            'placeholder':'********',
                                                            'class': 'width-100 last_input'
                                                        }), label="Password")

    def clean(self):
        print( self.cleaned_data )
        email = self.cleaned_data.get('email')
        password = self.cleaned_data.get('password')
        user = authenticate(email=email, password=password)
        if not user or not user.is_active:
            raise forms.ValidationError("Sorry, that login was invalid. Please try again.")
        return self.cleaned_data

    class Meta:
        fields = ['email', 'password']
