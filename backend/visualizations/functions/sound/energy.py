import numpy as np

from helpers.audio.expFilter import ExpFilter

class Energy():

    def initEnergy(self):
        self.p_filt = ExpFilter(
            np.tile(1, (3, self.number_of_pixels)),
            alpha_decay = 0.1,
            alpha_rise=0.99
        )

        ## 0.01 to 0.99 for speed setting

    def visualizeEnergy(self):
        """Effect that expands from the center with increasing sound energy"""
        self.audio_data = np.copy(self.audio_data)
        self.gain.update(self.audio_data)
        self.audio_data /= self.gain.value
        # Scale by the width of the LED strip
        self.audio_data *= float((self.number_of_pixels // 2) - 1)
        # Map color channels according to energy in the different freq bands
        scale = 0.9
        r = 0
        g = 0
        b = 0
        
        # r = int(np.mean(self.audio_data[:len(self.audio_data) // 3]**scale))
        # g = int(np.mean(self.audio_data[len(self.audio_data) // 3: 2 * len(self.audio_data) // 3]**scale))
        # b = int(np.mean(self.audio_data[2 * len(self.audio_data) // 3:]**scale))

        active_color_scheme = self.active_state.formatted_color_schemes[self.active_state.active_color_scheme_index]
        chunk_size =  len(self.audio_data) // len(active_color_scheme)
        for i in range(len(active_color_scheme)) :
            x = chunk_size * i
            y = chunk_size * (i + 1)
            value = int(np.mean(self.audio_data[x:y]**scale))
            r += int(value * active_color_scheme[i][0] / 100)
            g += int(value * active_color_scheme[i][1] / 100)
            b += int(value * active_color_scheme[i][2] / 100)

        self.pixels[0, :r] = 255.0
        self.pixels[0, r:] = 0.0
        self.pixels[1, :g] = 255.0
        self.pixels[1, g:] = 0.0
        self.pixels[2, :b] = 255.0
        self.pixels[2, b:] = 0.0

        self.p_filt.update(self.pixels)
        self.pixels = np.round(self.p_filt.value)

        self.pixels = self.blurFrame(self.pixels, self.active_state.blur_value)

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
