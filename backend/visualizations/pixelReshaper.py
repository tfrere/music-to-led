import numpy as np
from scipy.ndimage.filters import gaussian_filter1d


class PixelReshaper:

    def __init__(self, strip_config):
        self.strip_config = strip_config
        self.initActiveShape()

    @staticmethod
    def blurFrame(pixels, value=1.0):
        pixels[0, :] = gaussian_filter1d(
            pixels[0, :], sigma=value, mode="reflect")
        pixels[1, :] = gaussian_filter1d(
            pixels[1, :], sigma=value, mode="reflect")
        pixels[2, :] = gaussian_filter1d(
            pixels[2, :], sigma=value, mode="reflect")
        return pixels

    def initActiveShape(self):
        self.division_value = self.strip_config.active_state.division_value
        self._number_of_pixels = self.strip_config._shapes[
            self.division_value]._number_of_pixels
        self._number_of_strips = self.strip_config._shapes[
            self.division_value]._number_of_substrip
        self.strip_shape = self.strip_config._shapes[self.division_value].shape
        self._strips = []
        for i, strip_length in enumerate(self.strip_shape):
            self._strips.append([])
            self._strips[i] = np.tile(.0, (3, strip_length))

    def resetStrips(self):
        self._strips = []
        for i, strip_length in enumerate(self.strip_shape):
            self._strips.append([])
            self._strips[i] = np.tile(.0, (3, strip_length))

    # def concatenatePixels(self, strips):
    #     """Concatenate the x strips into 1"""

    #     tmp = [[], [], []]

    #     for i, strip_length in enumerate(self.strip_shape):
    #         tmp[0] = np.concatenate((tmp[0], strips[i][0]), axis=0)
    #         tmp[1] = np.concatenate((tmp[1], strips[i][1]), axis=0)
    #         tmp[2] = np.concatenate((tmp[2], strips[i][2]), axis=0)

    #     return tmp

    def concatenatePixels(self, strips):
        """Concatenate the x strips into 1"""
        stripsIndex = range(len(self.strip_shape))

        # define list of substrips
        listOfSubsStrips = [
            [strips[i][0] for i in stripsIndex],
            [strips[i][1] for i in stripsIndex],
            [strips[i][2] for i in stripsIndex],
        ]

        # Merge each list of substrips qccording to R, G, B indexes
        rgb = [
            [item for subStrips in listOfSubsStrips[0] for item in subStrips],
            [item for subStrips in listOfSubsStrips[1] for item in subStrips],
            [item for subStrips in listOfSubsStrips[2] for item in subStrips],
        ]

        return rgb

    def splitForStrips(self, strips, pixels):
        """Split pixels to respect the shape"""
        for i, strip_length in enumerate(self.strip_shape):
            center_of_strip = strip_length // 2
            if(self.strip_config.active_state.is_reverse and not self.strip_config.active_state.is_mirror):
                strips[i] = pixels[:, self._number_of_pixels - strip_length:]
            elif(self.strip_config.active_state.is_mirror and not self.strip_config.active_state.is_reverse):
                center = self._number_of_pixels // 2
                # performance improvements: put center_of_strip as global scope (each eaf must have it)
                strips[i] = pixels[
                    :,
                    center - center_of_strip:
                    center + center_of_strip
                ]
            elif(self.strip_config.active_state.is_mirror and self.strip_config.active_state.is_reverse):
                tmp = pixels[:, :center_of_strip]
                tmp2 = pixels[:, self._number_of_pixels - center_of_strip:]
                # performance improvements : tmp + tmp2 // watchout double di;ensions array contenated by indexes ==> requires double linked co;prehesnion list (cf concatenatePixels)
                strips[i] = np.concatenate((tmp, tmp2), axis=1)
            else:
                # performance improvements : strips[i][j] = pixels[0][:, strip_length + 1]  // Strip_length << pixels[i] / strip_length + 1 to get the strip_length index inside
                strips[i][0] = np.resize(pixels[0], strip_length)
                strips[i][1] = np.resize(pixels[1], strip_length)
                strips[i][2] = np.resize(pixels[2], strip_length)

        return self.concatenatePixels(strips)

    def reversePixels(self, pixels):
        """Reverse pixels"""
        # performance improvements : only reversed ? // To check if list() is required pixels[i][::-1] or pixels[i].reverse()
        pixels[0] = list(reversed(pixels[0]))
        pixels[1] = list(reversed(pixels[1]))
        pixels[2] = list(reversed(pixels[2]))
        return pixels

    def mirrorPixels(self, pixels, number_of_pixels):
        """Mirror pixels"""
        # performance improvements : number_of_pixels // 2 as constante
        # performance improvements : put variable to know if checking middle index vs end index
        # performance improvements : nu;py return new array // As we are in functionm args are passed as value, so the result is always a new object ==> manipulate object with pythons only
        tmp = []
        if(self.strip_config.active_state.is_reverse):
            tmp = np.copy(pixels[:, number_of_pixels // 2:])
        else:
            tmp = np.copy(pixels[:, :number_of_pixels // 2])

        return np.concatenate((tmp[:, ::-1], tmp), axis=1)

    def reshapeFromStrips(self, strips):

        tmp_s = []
        for x, strip in enumerate(strips):

            strip = self.blurFrame(
                strip, self.strip_config.active_state.blur_value)

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
            tmp_p = self.mirrorPixels(tmp_p, self._number_of_pixels)

        tmp_p = self.blurFrame(
            tmp_p, self.strip_config.active_state.blur_value)

        return self.splitForStrips(self._strips, tmp_p)


if __name__ == "__main__":
    import time
    from outputs.serial.main import Serial
    from config.stripConfig import StripConfig

    print('Starting PixelReshaper test on ports :')
    print(Serial.listAvailablePortsName())
    ports = Serial.listAvailablePortsName()

    settings = StripConfig()

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
    serialOutput = Serial(number_of_pixels, ports)
    serialOutput.setup()

    while True:
        pixels = np.roll(pixels, 1, axis=1)
        serialOutput.update(
            pixelReshaper.reshapeFromPixels(pixels)
        )
        time.sleep(.2)
