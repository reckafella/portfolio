from django.forms.utils import ErrorList


class CustomErrorList(ErrorList):
    """Custom Error List"""

    def __str__(self):
        return self.as_divs()

    def as_divs(self):
        if not self:
            return ""
        return "".join(
            f'<div class="alert alert-danger" role="alert">{e}</div>' for e in self
        )
