import numpy as np
import time

from scipy.ndimage.filters import gaussian_filter1d
from scipy.ndimage.interpolation import shift


def putPixel(strip, ledIndex, r, g, b):
    if(ledIndex < len(strip[0]) and ledIndex > -len(strip[0])):
        strip[0][ledIndex] = r
        strip[1][ledIndex] = g
        strip[2][ledIndex] = b


class PianoEcho():

    def initPianoEcho(self):
        self.piano_echo_notes_on = []
        self.pitch = 0
        self.value = 0

    def visualizePianoEcho(self):
        """Piano midi visualizer"""

        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]

        roll_value = int(1 * (self.active_state.time_interval / 100)) + 1

        new_midi_ranges = []
        old_midi_offset = self.strip_config.midi_range[0]
        midi_range_absolute_value = self.strip_config.midi_range[1] - \
            self.strip_config.midi_range[0]

        # TO BE REVIEWED 
        for x, strip in enumerate(self.pixelReshaper._strips):
            # print("index", x)
            # print("total", len(self.pixels[0]))
            # print("strip length", len(strip[0]))
            strip_length = len(strip[0])

            strip_percentage = (strip_length * 100) / len(self.pixels[0])
            # print("percent", strip_percentage)
            # print(
            #     "old range", self.strip_config.midi_range[0], self.strip_config.midi_range[1])

            midi_range_percentage = midi_range_absolute_value / 100 * strip_percentage
            midi_range_percentage += old_midi_offset
            # print(midi_range_percentage)
            new_midi_ranges.append(
                [int(old_midi_offset), int(midi_range_percentage)])
            old_midi_offset = midi_range_percentage

        # print("new_midi_ranges", new_midi_ranges)

        for midi_note in self.midi_datas:
            if(midi_note["type"] == "note_on" and midi_note["velocity"] > 0):
                for i, new_midi_range in enumerate(new_midi_ranges):
                    # TO BE REVIEWED 
                    if(new_midi_range[0] == new_midi_range[1] and midi_note["note"] >= new_midi_range[0] and midi_note["note"] <= new_midi_range[1]):
                        midi_note["midi_range_index"] = i
                        midi_note["spawn_time"] = self._timeSinceStart.getMs()
                        self.piano_echo_notes_on.append(midi_note)
                    if (midi_note["note"] > new_midi_range[0] and midi_note["note"] <= new_midi_range[1]):
                        midi_note["midi_range_index"] = i
                        midi_note["spawn_time"] = self._timeSinceStart.getMs()
                        self.piano_echo_notes_on.append(midi_note)
            if(midi_note["type"] == "note_off" or (midi_note["type"] == "note_on" and midi_note["velocity"] == 0)):
                for i, note_on in enumerate(self.piano_echo_notes_on):
                    if(note_on["note"] == midi_note["note"]):
                        del self.piano_echo_notes_on[i]

        # print(self.piano_echo_notes_on)
        color_index = 0

        for x, strip in enumerate(self.pixelReshaper._strips):


            self.pixelReshaper._strips[x] = np.roll(
                self.pixelReshaper._strips[x], roll_value, axis=1)
            for y in range(roll_value):
                putPixel(self.pixelReshaper._strips[x], y, 0, 0, 0)


            # self.pixelReshaper._strips[x] = np.roll(
            #     self.pixelReshaper._strips[x], roll_value, axis=1)
            # self.pixelReshaper._strips[x] = shift(
            #     self.pixelReshaper._strips[x], 5, cval=0)

            # for y in range(roll_value):
            #     putPixel(self.pixelReshaper._strips[x], y, 0, 0, 0)

            color_index = 0
            # pour chaque note active
            for i, note in enumerate(self.piano_echo_notes_on):
                # si on est dans la strip correspondante
                if (note["midi_range_index"] == x):
                    # print(color_index)
                    active_color_index = color_index % len(color_scheme)

                    # color transition over  time
                    ms = self._timeSinceStart.getMs()
                    diff = ms - note["spawn_time"]
                    time_since_spawn = round(diff / 1000, 2)
                    color_indexes = self.getColorIndexes(active_color_index, len(color_scheme))
                    color = self.rgbLerp(color_scheme[color_indexes[0]], color_scheme[color_indexes[1]], time_since_spawn)
                    # print(time_since_spawn)
                    # print(color_indexes)
                    # print(color)
                    r = color[0]
                    g = color[1]
                    b = color[2]
                    # end of color transition over  time

                    # r = color_scheme[active_color_index][0]
                    # g = color_scheme[active_color_index][1]
                    # b = color_scheme[active_color_index][2]

                    color_index += 1
                    for y in range(roll_value):
                        putPixel(self.pixelReshaper._strips[x], y, r, g, b)
                # print(strip)

        # print("end", self.pixelReshaper._strips)
        return self.pixelReshaper.reshapeFromStrips(self.pixelReshaper._strips)
