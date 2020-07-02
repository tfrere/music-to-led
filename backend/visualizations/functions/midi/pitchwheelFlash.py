import numpy as np

def getValueFromPercentage(value, percentage):
    return value / 100 * percentage

class PitchwheelFlash():

    def initPitchwheelFlash(self):

        self.r = 0
        self.g = 0
        self.b = 0

    def visualizePitchwheelFlash(self):
        """PitchwheelFlash midi visualizer"""

        color_scheme = self.active_state.formatted_color_schemes[self.active_state.active_color_scheme_index]

        which_color = 0
        for midi_note in self.midi_datas:

            if(midi_note["type"] == "pitchwheel"):
                pitch = midi_note["pitch"]

                value = self.clampToNewRange(pitch, 500, 8191, 0, 100)

                self.r = getValueFromPercentage(color_scheme[which_color][0], value)
                self.g = getValueFromPercentage(color_scheme[which_color][1], value)
                self.b = getValueFromPercentage(color_scheme[which_color][2], value)

        self.pixels[0] = self.r
        self.pixels[1] = self.g
        self.pixels[2] = self.b

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
