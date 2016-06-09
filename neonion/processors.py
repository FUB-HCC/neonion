def system_settings(request):
    from django.conf import settings

    return {
        'system': {
            'allow_registration' : 'accounts.backends.EmailAuthBackend' in settings.AUTHENTICATION_BACKENDS,
            'services': {
                'endpoint': {
                    'enabled': settings.ENDPOINT_ENABLED,
                }
            },
            'annotator': {
                'services': {
                    'stanford_ner': {
                        'enabled': settings.NER_SERVICE_ENABLED,
                        'service_url': settings.NER_SERVICE_URL,
                    }
                }
            }
        }
    }
