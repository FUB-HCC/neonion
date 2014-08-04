from django import forms

class AuthenticationForm(forms.Form):
    """
    Login form
    """
    email = forms.EmailField(widget=forms.EmailInput(attrs={
                                                        'placeholder':'Email',
                                                        'class': 'width-100',
                                                    }), label="")
    password = forms.CharField(widget=forms.PasswordInput(attrs={
                                                            'placeholder':'Password',
                                                            'class': 'width-100 last_input'
                                                        }), label="")

    class Meta:
        fields = ['email', 'password']
