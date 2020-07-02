from colour import Color

class ColorPalette:
    """ Instanciate a color list """
    def __init__(self):
        self.color_list = []
        self.number_of_colors = 0
        for i in range(30):
            self.color_list.append(
                Color(hue=i / 30, saturation=1, luminance=0.5))
        self.dictionary = []
        self.render()

    def render(self):
        self.dictionary = []
        for i, color in enumerate(self.color_list):
            rgb_255_color = self.interpolate_to_rgb_255(color)
            self.dictionary.append(
                [rgb_255_color[0], rgb_255_color[1], rgb_255_color[2]])
        self.number_of_colors = len(self.dictionary)

    @staticmethod
    def interpolate_to_rgb_255(color):
        r = (int)(color.rgb[0] * 255.999)
        g = (int)(color.rgb[1] * 255.999)
        b = (int)(color.rgb[2] * 255.999)
        return [r, g, b]


if __name__ == '__main__':

    import numpy as np
    import time

    colorPalette = ColorPalette()
    colorPalette.render()

    color_list = [
        Color("black"),
        Color("red"),
        Color("yellow"),
        Color("white")
    ]


    print(colorPalette.dictionary)


    # from outputs.serialOutput import SerialOutput
    # print('Starting ColorDictionary test on ports :')
    # ports = SerialOutput.listAvailablePortsName()
    # print(ports)

    # number_of_pixels_by_strip = 250
    #
    # pixels = np.tile(1, (3, number_of_pixels_by_strip))
    # pixels *= 0
    # for i, color in enumerate(colorPalette.dictionary):
    #     pixels[0, i] = color[0]
    #     pixels[1, i] = color[1]
    #     pixels[2, i] = color[2]
    #
    # serialOutput = SerialOutput(number_of_pixels_by_strip, ports[0])
    #
    # while True:
    #     pixels = np.roll(pixels, 1, axis=1)
    #     serialOutput.update(pixels)
    #     time.sleep(.02)
