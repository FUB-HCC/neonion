import uuid

from django.conf import settings


def generate_uri(resource_type, name=None):
    if name is None:
        # generate random uuid
        resource_id = uuid.uuid1().hex
    else:
        # generate uuid from provided name
        resource_id = uuid.uuid5(uuid.NAMESPACE_URL, str(name)).hex

    return '{}/{}/{}'.format(
        settings.NEONION['BASE_NAMESPACE'].rstrip('/'),
        resource_type,
        resource_id
    )