from django.http import HttpRequest


def is_ajax(request: HttpRequest) -> bool:
    '''
    Checks whether the request received is from Ajax. Returns a boolean value.
    '''
    return request.headers.get('X-Requested-With') == 'XMLHttpRequest'
