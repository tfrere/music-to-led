import time
import numpy as np

from helpers.audio.expFilter import ExpFilter


class ChannelIntensity():

    def initChannelIntensity(self):
        self.oldStripItensities = []
        self.oldMaxStripItensities = []
        self.intervalForDecrease = self._timeSinceStart.getMsIntervalFromBpm(
            self.active_state.time_interval)
        self.intervalForMaxDecrease = self._timeSinceStart.getMsIntervalFromBpm(
            self.active_state.time_interval) // 2

    def visualizeChannelIntensity(self):
        """ Effect that expands with increasing sound energy """

        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        self.audio_data = np.copy(self.audio_data)
        self.gain.update(self.audio_data)
        self.audio_data /= self.gain.value
        # Scale by the width of the LED strip
        self.audio_data *= float((self._number_of_pixels // 2) - 1)
        # Map color channels according to energy in the different freq bands
        scale = 0.9

        stripItensities = []
        maxStripItensities = []

        chunk_size = len(
            self.audio_data) // self.pixelReshaper._number_of_strips

        for i in range(self.pixelReshaper._number_of_strips):
            x = chunk_size * i
            y = chunk_size * (i + 1)

            intensity = int(np.max(self.audio_data[x:y]**scale))
            if(intensity < 0):
                intensity = 0

            max_intensity = len(self.pixelReshaper._strips[i][0])
            if(self.active_state.is_mirror):
                max_intensity = len(self.pixelReshaper._strips[i][0]) / 2

            if(intensity > max_intensity):
                intensity = max_intensity - 0.5

            stripItensities.append(intensity)
            maxStripItensities.append(intensity)

            if(self.oldStripItensities != [] and stripItensities[i] < self.oldStripItensities[i]):
                stripItensities[i] = self.oldStripItensities[i] - 2

            if(self.oldMaxStripItensities != [] and maxStripItensities[i] < self.oldMaxStripItensities[i]):
                maxStripItensities[i] = self.oldMaxStripItensities[i] - 1

        self.oldStripItensities = stripItensities
        self.oldMaxStripItensities = maxStripItensities

        self.pixelReshaper.initActiveShape()

        for x, strip in enumerate(self.pixelReshaper._strips):
            max_length = len(strip[0])
            for i in range(max_length):
                if(i < stripItensities[x]):
                    strip[0][i] = color_scheme[0][0]
                    strip[1][i] = color_scheme[0][1]
                    strip[2][i] = color_scheme[0][2]
                if(i == maxStripItensities[x]):
                    strip[0][i] = color_scheme[1][0] if len(
                        color_scheme) >= 2 else color_scheme[0][0]
                    strip[1][i] = color_scheme[1][1] if len(
                        color_scheme) >= 2 else color_scheme[0][1]
                    strip[2][i] = color_scheme[1][2] if len(
                        color_scheme) >= 2 else color_scheme[0][2]
                strip = self.blurFrame(strip, self.active_state.blur_value)

        return self.pixelReshaper.reshapeFromStrips(self.pixelReshaper._strips)
