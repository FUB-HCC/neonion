import uuid

from django.conf import settings
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from common.exceptions import InvalidResourceTypeError


def generate_uri(resource_type, name=None):
    validate = URLValidator()
    try:
        validate(resource_type)

        if name is None:
            # generate random uuid
            resource_id = uuid.uuid1().hex
        else:
            # generate uuid from provided name
            resource_id = uuid.uuid5(uuid.NAMESPACE_URL, name.lower().encode('utf8', 'replace')).hex

        concept_name = resource_type.rstrip('/').rsplit('/', 1)[1]
        return '{}/{}/{}'.format(
            settings.NEONION_BASE_NAMESPACE.rstrip('/'),
            concept_name,
            resource_id
        )
    except ValidationError:
        raise InvalidResourceTypeError(resource_type)


def generate_urn(name=None):
    if name is None:
        # generate random uuid
        resource_uuid = uuid.uuid1().hex
    else:
        # generate uuid from provided name
        resource_uuid = uuid.uuid5(uuid.NAMESPACE_URL, name.lower().encode('utf8', 'replace')).hex

    return 'urn:uuid:{}'.format(resource_uuid)
