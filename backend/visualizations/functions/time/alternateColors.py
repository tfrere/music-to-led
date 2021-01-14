import numpy as np


class AlternateColors():

    def initAlternateColors(self):
        self.alternate_colors_index = 0

    def drawAlternateColorChunks(self):

        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        self.alternateColorsInterval = self._timeSinceStart.getMsIntervalFromBpm(
            self.active_state.time_interval)

        chunk_size = self._number_of_pixels // self.active_state.chunk_size

        if(chunk_size == 0):
            chunk_size = 1

        which_color = 0
        for i in range(self._number_of_pixels):
            if(i % chunk_size == 0):
                which_color += 1
                if(which_color >= len(color_scheme)):
                    which_color = 0
            self.pixels[0][i] = color_scheme[which_color][0]
            self.pixels[1][i] = color_scheme[which_color][1]
            self.pixels[2][i] = color_scheme[which_color][2]

    def visualizeAlternateColorChunks(self):
        """Effect that alternate two colors moving forward"""
        self.drawAlternateColorChunks()
        relative_speed = self.active_state.time_interval / 50
        if (relative_speed < 2):
            relative_speed = 2
        self.pixels = np.roll(
            self.pixels, int(1 * (self._timeSinceStart.getMs() / 100) * relative_speed) + 1, axis=1)
        return self.pixelReshaper.reshapeFromPixels(self.pixels)

    def visualizeAlternateColorShapes(self):
        """Effect that alternate two colors moving forward"""
        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        interval = self._timeSinceStart.getMsIntervalFromBpm(
            self.active_state.time_interval)

        if(self._timeSinceStart.getMs() >= interval):
            self.alternate_colors_index += 1
            self._timeSinceStart.restart()

        which_color = self.alternate_colors_index % len(color_scheme)

        self.pixelReshaper.initActiveShape()

        for x, strip in enumerate(self.pixelReshaper._strips):
            which_color += 1
            if(which_color >= len(color_scheme)):
                which_color = 0
            max_length = len(strip[0])
            for i in range(max_length):
                strip[0][i] = color_scheme[which_color][0]
                strip[1][i] = color_scheme[which_color][1]
                strip[2][i] = color_scheme[which_color][2]

        return self.pixelReshaper.reshapeFromStrips(self.pixelReshaper._strips)
