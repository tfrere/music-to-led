import numpy as np

class Clear():

    def visualizeClear(self):
        self.pixels[0] = self.pixels[0] * 0
        self.pixels[1] = self.pixels[0] * 0
        self.pixels[2] = self.pixels[0] * 0

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
