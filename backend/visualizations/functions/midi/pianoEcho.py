import numpy as np
import time

from scipy.ndimage.filters import gaussian_filter1d


def putPixel(strip, ledIndex, r, g, b, velocity):
    # if(ledIndex < len(strip[0]) and ledIndex > -len(strip[0])):
    if(ledIndex < len(strip[0]) and ledIndex > 0):
        strip[0][ledIndex] = r / 127 * (velocity + 1)
        strip[1][ledIndex] = g / 127 * (velocity + 1)
        strip[2][ledIndex] = b / 127 * (velocity + 1)


def fadeOutPixels(pixels, value):
    tmp = [[], [], []]
    for i in range(3):
        for y in range(len(pixels[0])):
            if(pixels[i][y] - value < 0):
                pixels[i][y] = 0.0
            else:
                pixels[i][y] -= value


class PianoEcho():

    def initPianoEcho(self):

        self.notes_on = []
        self.notes_playing = []
        self.pitch = 0
        self.value = 0

    def visualizePianoEcho(self):
        """PianoEcho midi visualizer"""

        roll_value = int(1 * (self.active_state.time_interval / 100)) + 1

        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        for midi_note in self.midi_datas:
            if(midi_note["type"] == "note_on" and midi_note["velocity"] > 0):
                midi_note["time_since_apparation"] = 0
                self.notes_on.append(midi_note)
            if(midi_note["type"] == "note_off" or (midi_note["type"] == "note_on" and midi_note["velocity"] == 0)):
                for i, note_on in enumerate(self.notes_on):
                    if(note_on["note"] == midi_note["note"]):
                        self.notes_playing.append(self.notes_on[i])
                        del self.notes_on[i]

            if(midi_note["type"] == "pitchwheel"):
                self.pitch = midi_note["pitch"]

        value = self.clampToNewRange(self.pitch, -8191, 8191, 127, 255)
        roll_value = int(1 * (self.active_state.time_interval / 100)) + 1

        # which_color = 0
        # which_color = len(self.notes_on)
        # if(which_color >= len(color_scheme)):
        #     which_color = 0

        fadeOutPixels(self.pixels, 150)

        max_pixel_range = len(
            self.pixels[0]) // 2 if self.strip_config.active_state.is_mirror else len(self.pixels[0])

        for note in self.notes_on:

            note_value = self.clampToNewRange(
                note["note"], self.strip_config.midi_range[0], self.strip_config.midi_range[1], 0, max_pixel_range)
            note["color"] = 0

            putPixel(
                self.pixels,
                note_value,
                color_scheme[note["color"]][0],
                color_scheme[note["color"]][1],
                color_scheme[note["color"]][2],
                255
            )

        for note in self.notes_playing:

            note_value = self.clampToNewRange(
                note["note"], self.strip_config.midi_range[0], self.strip_config.midi_range[1], 0, max_pixel_range)

            note_left = note_value - note["time_since_apparation"] * roll_value
            note_right = note_value + \
                note["time_since_apparation"] * roll_value

            putPixel(
                self.pixels,
                note_left,
                color_scheme[note["color"]][0] -
                note["time_since_apparation"] * 10,
                color_scheme[note["color"]][1] -
                note["time_since_apparation"] * 10,
                color_scheme[note["color"]][2] -
                note["time_since_apparation"] * 10,
                255
            )

            putPixel(
                self.pixels,
                note_right,
                color_scheme[note["color"]][0] -
                note["time_since_apparation"] * 10,
                color_scheme[note["color"]][1] -
                note["time_since_apparation"] * 10,
                color_scheme[note["color"]][2] -
                note["time_since_apparation"] * 10,
                255
            )

            note["time_since_apparation"] += 1

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
