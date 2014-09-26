from django.shortcuts import render, render_to_response, redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as django_login, authenticate, logout as django_logout
from accounts.forms import AuthenticationForm, RegistrationForm
from accounts.models import User

import json
from django.http import HttpResponse

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

    return render_to_response('accounts/login.html', {
        'form': form,
    }, context_instance=RequestContext(request))

def register(request):
    """
    User registration view.
    """
    if request.method == 'POST':
        form = RegistrationForm(data=request.POST)
        if form.is_valid():
            user = form.save()
            #return redirect('/')
    else:
        form = RegistrationForm()

    return render_to_response('accounts/register.html', {
        'form': form,
    }, context_instance=RequestContext(request))

@login_required
def profile(request):
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
    return render_to_response('accounts/profile.html', context_instance=RequestContext(request) )

@login_required
def me(request):
    user = {
       'email': request.user.email,
       'name':  request.user.name,
       'surname': request.user.surname,
    }
    return HttpResponse(json.dumps(user), content_type="application/json")

def logout(request):
    """
    Log out view
    """
    django_logout(request)
    return redirect('/')


def list(request):
    activeUser = []
    for user in User.objects.all():
        activeUser.append(user.email)

    return HttpResponse(json.dumps(activeUser), content_type="application/json")
