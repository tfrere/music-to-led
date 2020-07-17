import numpy as np


class AlternateColors():

    def initAlternateColors(self):
        self.alternate_colors_index = 0
        self.hasBegun = False

    def drawAlternateColorChunks(self):

        color_scheme = self.active_state.formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        self.alternateColorsInterval = self.timeSinceStart.getMsIntervalFromBpm(
            self.active_state.time_interval)

        if(self.active_state.chunk_size == 0):
            self.active_state.chunk_size = 1

        which_color = 0
        for i in range(self.number_of_pixels):
            if(i % self.active_state.chunk_size == 0):
                which_color += 1
                if(which_color >= len(color_scheme)):
                    which_color = 0
            self.pixels[0][i] = color_scheme[which_color][0]
            self.pixels[1][i] = color_scheme[which_color][1]
            self.pixels[2][i] = color_scheme[which_color][2]
        print(self.hasBegun)
        if(not self.hasBegun):
            self.pixels = self.blurFrame(
                self.pixels, self.active_state.blur_value)
            self.hasBegun = True

    def visualizeAlternateColorChunks(self):
        """Effect that alternate two colors moving forward"""

        self.pixels = np.roll(
            self.pixels, int(1 * (self.active_state.time_interval / 100)) + 1, axis=1)
        return self.pixelReshaper.reshapeFromPixels(self.pixels)

    def visualizeAlternateColorShapes(self):
        """Effect that alternate two colors moving forward"""
        color_scheme = self.active_state.formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        interval = self.timeSinceStart.getMsIntervalFromBpm(
            self.active_state.time_interval)

        if(self.timeSinceStart.getMs() >= interval):
            self.alternate_colors_index += 1
            self.timeSinceStart.restart()

        which_color = self.alternate_colors_index % len(color_scheme)

        self.pixelReshaper.initActiveShape()

        for x, strip in enumerate(self.pixelReshaper.strips):
            which_color += 1
            if(which_color >= len(color_scheme)):
                which_color = 0
            max_length = len(strip[0])
            for i in range(max_length):
                strip[0][i] = color_scheme[which_color][0]
                strip[1][i] = color_scheme[which_color][1]
                strip[2][i] = color_scheme[which_color][2]

        return self.pixelReshaper.reshapeFromStrips(self.pixelReshaper.strips)
