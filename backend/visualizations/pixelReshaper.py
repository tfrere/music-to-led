import numpy as np


class PixelReshaper:

    def __init__(self, strip_config):
        self.strip_config = strip_config
        self.initActiveShape()

    def initActiveShape(self):
        self.division_value = self.strip_config.active_state.division_value
        self.number_of_pixels = self.strip_config.shapes[
            self.division_value].number_of_pixels
        self.number_of_strips = self.strip_config.shapes[
            self.division_value].number_of_substrip
        self.pixels = np.tile(.0, (3, self.number_of_pixels))
        self.strip_shape = self.strip_config.shapes[self.division_value].shape
        self.strips = []
        for i, strip_length in enumerate(self.strip_shape):
            self.strips.append([])
            self.strips[i] = np.tile(.0, (3, strip_length))

    def resetStrips(self):
        self.strips = []
        for i, strip_length in enumerate(self.strip_shape):
            self.strips.append([])
            self.strips[i] = np.tile(.0, (3, strip_length))

    def concatenatePixels(self, strips):
        """Concatenate the x strips into 1"""
        tmp = [[], [], []]

        for i, strip_length in enumerate(self.strip_shape):
            tmp[0] = np.concatenate((tmp[0], strips[i][0]), axis=0)
            tmp[1] = np.concatenate((tmp[1], strips[i][1]), axis=0)
            tmp[2] = np.concatenate((tmp[2], strips[i][2]), axis=0)

        return tmp

    def splitForStrips(self, strips, pixels):
        """Split pixels to respect the shape"""
        for i, strip_length in enumerate(self.strip_shape):
            if(self.strip_config.active_state.is_reverse and not self.strip_config.active_state.is_mirror):
                strips[i] = pixels[:, self.number_of_pixels - strip_length:]
            elif(self.strip_config.active_state.is_mirror and not self.strip_config.active_state.is_reverse):
                center = self.number_of_pixels // 2
                center_of_strip = strip_length // 2
                strips[i] = pixels[
                    :,
                    center - center_of_strip:
                    center + center_of_strip
                ]
            elif(self.strip_config.active_state.is_mirror and self.strip_config.active_state.is_reverse):
                tmp = pixels[:, :strip_length // 2]
                tmp2 = pixels[:, self.number_of_pixels - strip_length // 2:]
                strips[i] = np.concatenate((tmp, tmp2), axis=1)
            else:
                strips[i][0] = np.resize(pixels[0], strip_length)
                strips[i][1] = np.resize(pixels[1], strip_length)
                strips[i][2] = np.resize(pixels[2], strip_length)

        return self.concatenatePixels(strips)

    def reversePixels(self, pixels):
        """Reverse pixels"""
        pixels[0] = list(reversed(pixels[0]))
        pixels[1] = list(reversed(pixels[1]))
        pixels[2] = list(reversed(pixels[2]))
        return pixels

    def mirrorPixels(self, pixels, number_of_pixels):
        """Mirror pixels"""
        if(self.strip_config.active_state.is_reverse):
            tmp = np.copy(pixels[:, number_of_pixels // 2:])
            return np.concatenate((tmp[:, ::-1], tmp), axis=1)
        else:
            tmp = np.copy(pixels[:, :number_of_pixels // 2])
            return np.concatenate((tmp[:, ::-1], tmp), axis=1)

    def reshapeFromStrips(self, strips):

        tmp_s = []
        for x, strip in enumerate(strips):
            if(self.strip_config.active_state.is_reverse):
                strip = self.reversePixels(strip)
            if(self.strip_config.active_state.is_mirror):
                strip = self.mirrorPixels(strip, len(strip[0]))
            tmp_s.append(np.copy(strip))

        return self.concatenatePixels(tmp_s)

    def reshapeFromPixels(self, pixels):

        tmp_p = np.copy(pixels)
        if(self.strip_config.active_state.is_reverse):
            tmp_p = self.reversePixels(tmp_p)
        if(self.strip_config.active_state.is_mirror):
            tmp_p = self.mirrorPixels(tmp_p, self.number_of_pixels)

        return self.splitForStrips(self.strips, tmp_p)


if __name__ == "__main__":
    import time
    from outputs.serialOutput import SerialOutput
    from settings.settingsLoader import StripSettings

    print('Starting PixelReshaper test on ports :')
    print(SerialOutput.listAvailablePortsName())
    ports = SerialOutput.listAvailablePortsName()

    settings = StripSettings()

    number_of_pixels = 16

    pixelReshaper = PixelReshaper(
        settings
    )

    pixels = np.tile(0., (3, number_of_pixels))
    pixels[0, 0] = 255
    pixels[1, 1] = 255

    pixels[0, number_of_pixels - 1] = 255
    pixels[1, number_of_pixels - 2] = 255

    tmp = pixelReshaper.reshapeFromPixels(pixels)
    serialOutput = SerialOutput(number_of_pixels, ports)
    serialOutput.setup()

    while True:
        pixels = np.roll(pixels, 1, axis=1)
        serialOutput.update(
            pixelReshaper.reshapeFromPixels(pixels)
        )
        time.sleep(.2)
