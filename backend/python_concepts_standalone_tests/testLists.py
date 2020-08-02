import numpy as np
import timeit


def concatenatePixels2(strip_shape, strips):
    stripsIndex = range(len(strip_shape))

    print(stripsIndex)

    # define list o substrips
    listOfSubsStrips = [
        [strips[i][0] for i in stripsIndex],
        [strips[i][1] for i in stripsIndex],
        [strips[i][2] for i in stripsIndex],
    ]

    print("here", listOfSubsStrips)
    # MErge eqch list of substrips qccording to R, G, B indexes
    rgb = [
        [item for subStrips in listOfSubsStrips[0] for item in subStrips],
        [item for subStrips in listOfSubsStrips[1] for item in subStrips],
        [item for subStrips in listOfSubsStrips[2] for item in subStrips],
    ]

    return rgb


def concatenatePixels(strip_shape, strips):
    tmp = [[], [], []]

    for i, strip_length in enumerate(strip_shape):
        tmp[0] = np.concatenate((tmp[0], strips[i][0]), axis=0)
        tmp[1] = np.concatenate((tmp[1], strips[i][1]), axis=0)
        tmp[2] = np.concatenate((tmp[2], strips[i][2]), axis=0)

    return tmp


pixels = np.tile(1, (3, 40))
pixels *= 0
pixels[0, 0] = 125  # Set 1st pixel red
pixels[1, 1] = 125  # Set 2nd pixel green
pixels[2, 2] = 125  # Set 3rd pixel blue

pixels2 = [pixels, pixels]

print(concatenatePixels([40, 40], pixels2))
print(concatenatePixels2([40, 40], pixels2))

test = timeit.Timer(
    "concatenatePixels([40, 40], pixels2)", setup="""
import numpy as np

pixels = np.tile(1, (3, 40))
pixels *= 0
pixels[0, 0] = 125  # Set 1st pixel red
pixels[1, 1] = 125  # Set 2nd pixel green
pixels[2, 2] = 125  # Set 3rd pixel blue

pixels2 = [pixels, pixels]


def concatenatePixels(strip_shape, strips):
    tmp = [[], [], []]

    for i, strip_length in enumerate(strip_shape):
        tmp[0] = np.concatenate((tmp[0], strips[i][0]), axis=0)
        tmp[1] = np.concatenate((tmp[1], strips[i][1]), axis=0)
        tmp[2] = np.concatenate((tmp[2], strips[i][2]), axis=0)

    return tmp

""")

print("test1", test.timeit(100000))


test = timeit.Timer(
    "concatenatePixels([40, 40], pixels2)", setup="""
import numpy as np

pixels = np.tile(1, (3, 40))
pixels *= 0
pixels[0, 0] = 125  # Set 1st pixel red
pixels[1, 1] = 125  # Set 2nd pixel green
pixels[2, 2] = 125  # Set 3rd pixel blue

pixels2 = [pixels, pixels]


def concatenatePixels(strip_shape, strips):
    stripsIndex = range(len(strip_shape))

    rgb = [
        [strips[i][0] for i in stripsIndex],
        [strips[i][1] for i in stripsIndex],
        [strips[i][2] for i in stripsIndex]
    ]

    return rgb

""")

print("test2", test.timeit(100000))
