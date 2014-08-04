from django import forms

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

    class Meta:
        fields = ['email', 'password']
