import numpy as np

class FullColor():

    def initFullColor(self):
        self.old_full_intensity = 0

    def visualizeFullColor(self):
        color_scheme = self.active_state.formatted_color_schemes[self.active_state.active_color_scheme_index]
        self.pixels[0] = self.lerp(self.pixels[0], color_scheme[0][0], self.old_full_intensity)
        self.pixels[1] = self.lerp(self.pixels[1], color_scheme[0][1], self.old_full_intensity)
        self.pixels[2] = self.lerp(self.pixels[2], color_scheme[0][2], self.old_full_intensity)
        if(self.old_full_intensity < 1):
            self.old_full_intensity += 0.01

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
