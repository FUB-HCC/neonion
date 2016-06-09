

class InvalidAnnotationError(Exception):

    def __init__(self, message, code=None, params=None):
        super(InvalidAnnotationError, self).__init__(message, code, params)

    def __str__(self):
        if hasattr(self, 'error_dict'):
            return repr(dict(self))
        return repr(list(self))

    def __repr__(self):
        return 'InvalidAnnotationError(%s)' % self


class InvalidResourceTypeError(Exception):

    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)
