import numpy as np


class DrawLine():

    def visualizeDrawLine(self):
        """Effect that alternate two colors moving forward"""
        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        self.pixels = np.roll(
            self.pixels, int(1 * (self.active_state.time_interval / 100)) + 1, axis=1)

        self.pixels[0][0] = color_scheme[0][0]
        self.pixels[1][0] = color_scheme[0][1]
        self.pixels[2][0] = color_scheme[0][2]

        self.pixels = self.blurFrame(self.pixels, self.active_state.blur_value)

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
