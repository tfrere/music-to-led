import numpy as np

class FadeOut():

    def initFadeOut(self):
        self.old_fade_out_intensity = 0

    def VisualizeFadeOut(self):
        self.pixels[0] = self.pixels[0] * self.old_fade_out_intensity
        self.pixels[1] = self.pixels[1] * self.old_fade_out_intensity
        self.pixels[2] = self.pixels[2] * self.old_fade_out_intensity
        self.pixels = np.clip(self.pixels, 0, 255)
        if(self.old_fade_out_intensity > 0):
            self.old_fade_out_intensity -= 0.01

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
