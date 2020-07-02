import time
import numpy as np

from helpers.audio.expFilter import ExpFilter

class ChannelFlash():

    def initChannelFlash(self):
        self.oldStripItensities = []
        self.oldMaxStripItensities = []
        self.intervalForDecrease = self.timeSinceStart.getMsIntervalFromBpm(self.active_state.time_interval)
        self.intervalForMaxDecrease = self.timeSinceStart.getMsIntervalFromBpm(self.active_state.time_interval) // 2

    def visualizeChannelFlash(self):
        """ Effect that expands with increasing sound energy """

        color_scheme = self.active_state.formatted_color_schemes[self.active_state.active_color_scheme_index]

        self.audio_data = np.copy(self.audio_data)
        self.gain.update(self.audio_data)
        self.audio_data /= self.gain.value
        # Scale by the width of the LED strip
        self.audio_data *= float((self.number_of_pixels // 2) - 1)
        # Map color channels according to energy in the different freq bands
        scale = 0.9

        stripItensities = []
        maxStripItensities = []

        chunk_size = len(self.audio_data) // self.pixelReshaper.number_of_strips

        for i in range(self.pixelReshaper.number_of_strips) :
            x = chunk_size * i
            y = chunk_size * (i + 1)

            intensity = int(np.max(self.audio_data[x:y]**scale))
            if(intensity < 0) :
                intensity = 0

            max_intensity = len(self.pixelReshaper.strips[i][0])
            if(self.active_state.is_mirror):
                max_intensity = len(self.pixelReshaper.strips[i][0]) / 2

            if(intensity > max_intensity):
                intensity = max_intensity - 1

            stripItensities.append(intensity)
            maxStripItensities.append(intensity)

            if(self.oldStripItensities != [] and stripItensities[i] < self.oldStripItensities[i]) :
                stripItensities[i] = self.oldStripItensities[i] - 1

            if(self.oldMaxStripItensities != [] and maxStripItensities[i] < self.oldMaxStripItensities[i]) :
                maxStripItensities[i] = self.oldMaxStripItensities[i] - 1


        self.oldStripItensities = stripItensities
        self.oldMaxStripItensities = maxStripItensities

        self.pixelReshaper.initActiveShape()

        for x, strip in enumerate(self.pixelReshaper.strips):
            colorIndex = x % len(color_scheme)
            strip[0] = (color_scheme[colorIndex][0] / 255) * (maxStripItensities[x] * 10)
            strip[1] = (color_scheme[colorIndex][1] / 255) * (maxStripItensities[x] * 10)
            strip[2] = (color_scheme[colorIndex][2] / 255) * (maxStripItensities[x] * 10)

        return self.pixelReshaper.reshapeFromStrips(self.pixelReshaper.strips)
