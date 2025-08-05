import random

from captcha.conf import settings


def math_challenge():
    operators = ("+", "*", "-")
    operands = (random.randint(1, 100), random.randint(1, 100))
    operator = random.choice(operators)
    if operands[0] < operands[1] and "-" == operator:
        operands = (operands[1], operands[0])
    challenge = "%d%s%d" % (operands[0], operator, operands[1])
    return (
        "{}=".format(challenge.replace(
            "*", settings.CAPTCHA_MATH_CHALLENGE_OPERATOR)),
        str(eval(challenge)),
    )
