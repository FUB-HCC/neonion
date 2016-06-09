<<<<<<< HEAD
=======
from django.conf import settings
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8
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
<<<<<<< HEAD
            user = authenticate(email=request.POST['email'], password=request.POST['password'])
=======
            user = authenticate(username=request.POST['username'], password=request.POST['password'])
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 1bea216863a0081c62611ce1969537c2b6a727d8


def logout(request):
    """
    Log out view
    """
    django_logout(request)
    return redirect('accounts.views.login')