from django.conf import settings
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.contrib.auth import login as django_login, authenticate, logout as django_logout
from accounts.forms import AuthenticationForm, RegistrationForm


def login(request):
    """
    Login view
    """
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = authenticate(username=request.POST['username'], password=request.POST['password'])
            if user is not None:
                if user.is_active:
                    django_login(request, user)
                    return redirect('/')
    else:
        form = AuthenticationForm()

    return render_to_response('login.html', {
        'form': form,
    }, context_instance=RequestContext(request))


def register(request):
    """
    User registration view.
    """
    if 'accounts.backends.EmailAuthBackend' in settings.AUTHENTICATION_BACKENDS:
        success = False
        show_activation_info = False
        if request.method == 'POST':
            form = RegistrationForm(data=request.POST)
            if form.is_valid():
                user = form.save()
                success = True
                show_activation_info = not user.is_active
        else:
            form = RegistrationForm()

        return render_to_response('register.html', {
            'form': form, 'success': success, 'show_activation_info': show_activation_info
        }, context_instance=RequestContext(request))
    else:
        return redirect('accounts.views.login')


def logout(request):
    """
    Log out view
    """
    django_logout(request)
    return redirect('accounts.views.login')