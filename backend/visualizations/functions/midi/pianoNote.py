
import numpy as np
import time

from scipy.ndimage.filters import gaussian_filter1d


def putPixel(strip, ledIndex, r, g, b, velocity):
    if(ledIndex <= len(strip[0])):
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


class PianoNote():

    def initPianoNote(self):
        self.piano_notes_on = []
        self.pitch = 0
        self.value = 0

    def visualizePianoNote(self):
        """PianoNote midi visualizer"""

        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        for midi_note in self.midi_datas:
            if(midi_note["type"] == "note_on" and midi_note["velocity"] > 0):
                midi_note["time_since_apparation"] = 0
                self.piano_notes_on.append(midi_note)
                midi_note["color"] = 0
            if(midi_note["type"] == "note_off" or (midi_note["type"] == "note_on" and midi_note["velocity"] == 0)):
                for i, note_on in enumerate(self.piano_notes_on):
                    if(note_on["note"] == midi_note["note"]):
                        del self.piano_notes_on[i]

            if(midi_note["type"] == "pitchwheel"):
                self.pitch = midi_note["pitch"]

        value = self.clampToNewRange(self.pitch, -8191, 8191, 127, 255)
        roll_value = int(1 * (self.active_state.time_interval / 100)) + 1
        fade_out_value = self.active_state.time_interval / 10

        for x, strip in enumerate(self.pixelReshaper._strips):

            strip_length = len(
                strip[0]) // 2 if self.strip_config.active_state.is_mirror else len(strip[0])

            for note in self.piano_notes_on:

                note["time_since_apparation"] += 1
                putPixel(
                    strip,
                    self.clampToNewIntRange(
                        note["note"], self.strip_config.midi_range[0], self.strip_config.midi_range[1], 0, strip_length),
                    color_scheme[note["color"]][0],
                    color_scheme[note["color"]][1],
                    color_scheme[note["color"]][2],
                    value
                )
            fadeOutPixels(strip, fade_out_value)

        return self.pixelReshaper.reshapeFromStrips(self.pixelReshaper._strips)
