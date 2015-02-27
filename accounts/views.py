from django.shortcuts import render_to_response, redirect
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
from django.contrib.auth import login as django_login, authenticate, logout as django_logout
from accounts.forms import AuthenticationForm, RegistrationForm
from accounts.models import User
from django.http import JsonResponse


def login(request):
    """
    Login view
    """
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = authenticate(email=request.POST['email'], password=request.POST['password'])
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


@login_required
def profile(request, user):
    """
    profile view.
    """
    # if request.method == 'POST':
    #     form = RegistrationForm(data=request.POST)
    #     if form.is_valid():
    #         user = form.save()
    #         return redirect('/')
    # else:
    #     form = RegistrationForm()
    return render_to_response('profile.html', context_instance=RequestContext(request))


@login_required
def me(request):
    user = {
        'email': request.user.email,
        'name':  request.user.name,
        'surname': request.user.surname,
    }
    return JsonResponse(user)


def logout(request):
    """
    Log out view
    """
    django_logout(request)
    return redirect('/')