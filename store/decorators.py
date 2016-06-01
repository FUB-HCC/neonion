from accounts.models import WorkingGroup
from documents.models import Document
from django.http import HttpResponseForbidden


def require_group_permission(view_func, group_key='group_pk', document_key='document_pk'):
    """Requires user membership in the groups passed in."""
    def _decorated(view, request, *args, **kwargs):
        # check if the group is not private
        if kwargs[group_key] != request.user.email:
            group = WorkingGroup.objects.get(pk=kwargs[group_key])
            document = Document.objects.get(pk=kwargs[document_key])

            # check if the user is entitled in the group and the group contains the document
            if request.user in group.members.all() and document in group.documents.all():
                return view_func(view, request, *args, **kwargs)
            else:
                return HttpResponseForbidden()
        else:
            return view_func(view, request, *args, **kwargs)

    return _decorated
