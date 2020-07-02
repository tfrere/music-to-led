# import numpy as np
# import time
#
# from scipy.ndimage.filters import gaussian_filter1d
#
# def putPixel(strip, ledIndex, r, g, b, velocity):
#     # if(ledIndex < len(strip[0]) and ledIndex > -len(strip[0])):
#     if(ledIndex < len(strip[0]) and ledIndex > 0):
#         strip[0][ledIndex] = r / 127 * (velocity + 1)
#         strip[1][ledIndex] = g / 127 * (velocity + 1)
#         strip[2][ledIndex] = b / 127 * (velocity + 1)
#
# def fadeOutPixels(pixels, value):
#     tmp = [[],[],[]]
#     for i in range(3):
#         for y in range(len(pixels[0])):
#             if(pixels[i][y] - value < 0):
#                 pixels[i][y] = 0.0
#             else:
#                 pixels[i][y] -= value
#
# class PianoNote():
#
#     def initPianoNote(self):
#
#         self.notes_on = []
#         self.notes_playing = []
#         self.pitch = 0
#         self.value = 0
#
#     def visualizePianoNote(self):
#         """PianoNote midi visualizer"""
#
#         color_scheme = self.active_state.formatted_color_schemes[self.active_state.active_color_scheme_index]
#
#         for midi_note in self.midi_datas:
#             if(midi_note["type"] == "note_on" and midi_note["velocity"] > 0):
#                 midi_note["time_since_apparation"] = 0
#                 self.notes_on.append(midi_note)
#             if(midi_note["type"] == "note_off" or (midi_note["type"] == "note_on" and midi_note["velocity"] == 0)):
#                 for i, note_on in enumerate(self.notes_on):
#                     if(note_on["note"] == midi_note["note"]):
#                         self.notes_playing.append(self.notes_on[i])
#                         del self.notes_on[i]
#
#             if(midi_note["type"] == "pitchwheel"):
#                 self.pitch = midi_note["pitch"]
#
#         value = self.clampToNewRange(self.pitch, -8191, 8191, 127, 255)
#         roll_value = int(1 * (self.active_state.time_interval / 100)) + 1
#
#         which_color = 0
#         which_color = len(self.notes_on)
#         if(which_color >= len(color_scheme)):
#             which_color = 0
#
#         fadeOutPixels(self.pixels, 105)
#
#         for note in self.notes_on:
#
#             note_value = self.clampToNewRange(note["note"], 0,127, 0, len(self.pixels[0]))
#             if(note["note"] > 65):
#                 color = 1
#             else:
#                 color = 0
#             note["color"] = which_color
#
#             putPixel(
#                 self.pixels,
#                 note_value,
#                 color_scheme[note["color"]][0],
#                 color_scheme[note["color"]][1],
#                 color_scheme[note["color"]][2],
#                 value
#             )
#
#
#         for note in self.notes_playing:
#
#             note_value = clampToNewRange(note["note"], 0,127, 0, len(self.pixels[0]))
#
#             note_left = note_value - note["time_since_apparation"] // 2 * note["velocity"] // 10
#             note_right = note_value + note["time_since_apparation"] // 2 * note["velocity"] // 10
#
#             putPixel(
#                 self.pixels,
#                 note_left,
#                 color_scheme[note["color"]][0] - 50 - note["time_since_apparation"] * 3,
#                 color_scheme[note["color"]][1] - 50 - note["time_since_apparation"] * 3,
#                 color_scheme[note["color"]][2] - 50 - note["time_since_apparation"] * 3,
#                 value
#             )
#
#             putPixel(
#                 self.pixels,
#                 note_right,
#                 color_scheme[note["color"]][0] - 50 - note["time_since_apparation"] * 3,
#                 color_scheme[note["color"]][1] - 50 - note["time_since_apparation"] * 3,
#                 color_scheme[note["color"]][2] - 50 - note["time_since_apparation"] * 3,
#                 value
#             )
#
#             note["time_since_apparation"] += 1
#
#         # # Apply substantial blur to smooth the edges
#         self.pixels = self.blurFrame(self.pixels, 1.5)
#
#         return self.pixelReshaper.reshapeFromPixels(self.pixels)



import numpy as np
import time

from scipy.ndimage.filters import gaussian_filter1d

def putPixel(strip, ledIndex, r, g, b, velocity):
    if(ledIndex <= len(strip[0])):
        strip[0][ledIndex] = r / 127 * (velocity + 1)
        strip[1][ledIndex] = g / 127 * (velocity + 1)
        strip[2][ledIndex] = b / 127 * (velocity + 1)

def fadeOutPixels(pixels, value):
    tmp = [[],[],[]]
    for i in range(3):
        for y in range(len(pixels[0])):
            if(pixels[i][y] - value < 0):
                pixels[i][y] = 0.0
            else:
                pixels[i][y] -= value

class PianoNote():

    def initPianoNote(self):
        self.notes_on = []
        self.pitch = 0
        self.value = 0

    def visualizePianoNote(self):
        """PianoNote midi visualizer"""

        color_scheme = self.active_state.formatted_color_schemes[self.active_state.active_color_scheme_index]

        which_color = 0
        which_color = len(self.notes_on)
        if(which_color >= len(color_scheme)):
            which_color = 0

        for midi_note in self.midi_datas:
            if(midi_note["type"] == "note_on" and midi_note["velocity"] > 0):
                midi_note["time_since_apparation"] = 0
                self.notes_on.append(midi_note)
                midi_note["color"] = which_color
            if(midi_note["type"] == "note_off" or (midi_note["type"] == "note_on" and midi_note["velocity"] == 0)):
                for i, note_on in enumerate(self.notes_on):
                    if(note_on["note"] == midi_note["note"]):
                        del self.notes_on[i]

            if(midi_note["type"] == "pitchwheel"):
                self.pitch = midi_note["pitch"]

        value = self.clampToNewRange(self.pitch, -8191, 8191, 127, 255)
        roll_value = int(1 * (self.active_state.time_interval / 100)) + 1

        fadeOutPixels(self.pixels, 5)

        for note in self.notes_on:

            note["time_since_apparation"] += 1

            putPixel(
                self.pixels,
                self.clampToNewRange(note["note"], 0,127, 0, len(self.pixels[0])),
                color_scheme[note["color"]][0],
                color_scheme[note["color"]][1],
                color_scheme[note["color"]][2],
                value
            )

        # # Apply substantial blur to smooth the edges
        self.pixels = self.blurFrame(self.pixels, self.active_state.blur_value)

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
