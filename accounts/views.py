from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
from django.contrib.auth.decorators import login_required
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
    if request.method == 'POST':
        form = RegistrationForm(data=request.POST)
        if form.is_valid():
            user = form.save()
            success = True
    else:
        form = RegistrationForm()

    return render_to_response('register.html', {
        'form': form, 'success': success
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
    return render_to_response('profile.html', context_instance=RequestContext(request) )


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


@login_required
def list(request):
    # get user enumeration
    users = []
    for user in User.objects.all():
        users.append({ 
            'username': user.email,
            'isActive': user.is_active,
            'isAdmin': user.is_admin,
        })
    
    return render_to_response('list_user.html', {
        'users': users
    }, context_instance=RequestContext(request))


@login_required
def delete_user(request, userID):
    user = User.objects.filter(email=userID)[0]
    if not user.is_admin:
        user.delete()

    return redirect('accounts.views.list')


@login_required
def edit_user(request, userID):
    if request.method == 'GET':
        user = User.objects.filter(email=userID)[0]
        if 'active' in request.GET:
            user.is_active = bool(int(request.GET['active']))
        if 'admin' in request.GET:
            user.is_admin = bool(int(request.GET['admin']))
        
        user.save()

    return redirect('accounts.views.list')
