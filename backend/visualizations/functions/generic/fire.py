import os
import random
import time
import numpy as np


def qsub8(i, j):
    t = i - j
    if(t < 0):
        t = 0
    return t


def qadd8(i, j):
    t = i + j
    if(t > 255):
        t = 255
    return t


def scale8(i, scale):
    return (i * scale) >> 8


def random8(min, max):
    return random.randrange(min, max, 1)


class Fire():

    def initFire(self):
        # // SPARKING: What chance (out of 255) is there that a new spark will be lit?
        # // Higher chance = more roaring fire.  Lower chance = more flickery fire.
        # // Default 120, suggested range 50-200.
        self.sparking = 120
        # // COOLING: How much does the air cool as it rises?
        # // Less cooling = taller flames.  More cooling = shorter flames.
        # // Default 55, suggested range 20-100
        self.cooling = 100

        self.palette = [[0, 0, 0], [255, 0, 0], [255, 255, 0], [255, 255, 255]]

        self.heat = [0] * self._number_of_pixels

    @staticmethod
    def heatColor(temperature):

        heatColor = [0, 0, 0]
        # t192 = self.clampToNewRange(temperature, 0, 255, 0, 192)
        t192 = scale8(temperature, 192)

        heatramp = t192 & 0x3F  # 0..63
        heatramp <<= 2  # scale up to 0..252

        # we're in the hottest third
        if(t192 & 0x80):
            heatColor[0] = 255
            heatColor[1] = 255
            heatColor[2] = heatramp
         # we're in the middle third
        elif(t192 & 0x40):
            heatColor[0] = 255
            heatColor[1] = heatramp
            heatColor[2] = 0
         # we're in the coldest third
        else:
            heatColor[0] = heatramp
            heatColor[1] = 0
            heatColor[2] = 0

        return heatColor

    def visualizeFire(self):

        # Step 1.  Cool down every cell a little
        for i in range(self._number_of_pixels):
            self.heat[i] = qsub8(
                self.heat[i],
                random8(0, ((self.cooling * 10) // self._number_of_pixels) + 2)
            )

        # print("step 1")
        # print(self.heat)

        # Step 2.  Heat from each cell drifts 'up' and diffuses a little
        for k in range(self._number_of_pixels - 3, -1, -1):
            self.heat[k] = (self.heat[k - 1] +
                            self.heat[k - 2] + self.heat[k - 2]) // 3

        # print("step 2")
        # print(self.heat)

        # Step 3.  Randomly ignite new 'sparks' of heat near the bottom
        if(random8(0, 255) < self.sparking):
            y = random8(0, 7)
            self.heat[y] = qadd8(self.heat[y], random8(160, 255))

        # print("step 3")
        # print(self.heat)

        # Step 4.  Map from heat cells to LED colors
        for j in range(self._number_of_pixels):

            # // Scale the heat value from 0-255 down to 0-240
            # // for best results with color palettes.
            # colorindex = scale8( self.heat[j], 240);
            # print(colorindex)
            # # leds[j] = palette[colorindex]

            color = self.heatColor(self.heat[j])
            self.pixels[0][j] = color[0]
            self.pixels[1][j] = color[1]
            self.pixels[2][j] = color[2]

        # print("step 4")
        # print(self.pixels)

        self.pixels[0][0] += 150
        self.pixels[1][0] += 150
        self.pixels[2][0] += 150
        self.pixels[0][1] += 100
        self.pixels[1][1] += 100
        self.pixels[2][1] += 100
        self.pixels[0][2] += 50
        self.pixels[1][2] += 50
        self.pixels[2][2] += 50

        time.sleep(0.015)

        # self.pixels = self.blurFrame(self.pixels, self.active_state.blur_value)
        self.pixels = self.blurFrame(self.pixels, 3.0)

        return self.pixelReshaper.reshapeFromPixels(self.pixels)

#
# fire = Fire()
#
# fire.initFire()
# fire.visualizeFire()
#
# while 1:
#     fire.visualizeFire()
#     # time.sleep(0.5)
