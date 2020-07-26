import psutil
import os


def isAnEvenArray(arr):
    for item in arr:
        if(item % 2 == 1):
            return False
    return True


def subdivideShape(shape, subdivision_level=1):
    """ input : shape array [37, 13, 42]
        output : split it subdivided shapes """

    newShape = []
    for i, value in enumerate(shape):
        newValue = value / subdivision_level
        for i in range(subdivision_level):
            newShape.append(int(newValue))

    return newShape


def autoKill():
    parent = psutil.Process(os.getpid())
    parent.kill()
