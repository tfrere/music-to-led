import numpy as np


class DrawLine():

    def visualizeDrawLine(self):
        """Effect that alternate two colors moving forward"""
        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        time_since_start = self._timeSinceStart.getMs() / 100
        speed = self.active_state.time_interval / 10

        fill_value = time_since_start * speed

        for x, strip in enumerate(self.pixelReshaper._strips):

            strip_length = len(
                strip[0]) // 2 if self.strip_config.active_state.is_mirror else len(strip[0])

            for i in range(len(strip[0])):
                if(self.clampToNewIntRange(fill_value, 0, len(self.pixels[0]), 0, strip_length) > i):
                    strip[0][i] = color_scheme[0][0]
                    strip[1][i] = color_scheme[0][1]
                    strip[2][i] = color_scheme[0][2]

        return self.pixelReshaper.reshapeFromStrips(self.pixelReshaper._strips)
