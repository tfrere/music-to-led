import numpy as np

from copy import deepcopy


def convertRange(value, r1, r2, rounded=True):
    value = ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0]
    if(rounded is True):
        return round(value)
    else:
        return round(value * 10) / 10


class ModSwitcher:

    def __init__(self, visualizer, config, index, verbose=False):

        self.config = config
        self.strip_config = config.strips[index]
        self.active_state = self.strip_config.active_state

        self.visualizer = visualizer
        self.verbose = verbose

    def logger(self, name, information):
        if(self.verbose):
            print("Strip " + name + " : ", end="")
            print(information)

    @staticmethod
    def valueUpdater(old_value, value, max, increment):
        new_value = old_value

        if(value * increment >= max):
            new_value += increment
            if(new_value >= max):
                new_value = 0
        else:
            new_value = value * increment

        return new_value

    def changeMod(self):
        if(self.midi_datas):
            for midi_data in self.midi_datas:
                if(midi_data["type"] == "note_on"):
                    mode = midi_data["note"]
                    velocity = midi_data["velocity"]
                    old_vizualizer_effect = self.active_state.active_visualizer_effect
                    # VISUALIZATIONS EFFECTS
                    base_note_increment = 48
                    if(mode >= base_note_increment + 0 and mode < base_note_increment + 16):

                        # SOUND BASED
                        if(mode == base_note_increment + 0):
                            self.visualizer.resetFrame()
                            self.active_state.active_visualizer_effect = "scroll"
                        elif(mode == base_note_increment + 1):
                            self.active_state.active_visualizer_effect = "energy"
                        elif(mode == base_note_increment + 2):
                            self.active_state.active_visualizer_effect = "channel_flash"
                        elif(mode == base_note_increment + 3):
                            self.active_state.active_visualizer_effect = "channel_intensity"
                        elif(mode == base_note_increment + 4):
                            self.active_state.active_visualizer_effect = "spectrum"

                        # MIDI BASED
                        elif(mode == base_note_increment + 5):
                            self.visualizer.resetFrame()
                            self.active_state.active_visualizer_effect = "piano_scroll"
                        elif(mode == base_note_increment + 6):
                            self.visualizer.resetFrame()
                            self.active_state.active_visualizer_effect = "piano_note"
                        elif(mode == base_note_increment + 7):
                            self.visualizer.resetFrame()
                            self.active_state.active_visualizer_effect = "pitchwheel_flash"

                        # TIME BASED
                        elif(mode == base_note_increment + 8):
                            self.visualizer.drawAlternateColorChunks()
                            self.active_state.active_visualizer_effect = "alternate_color_chunks"
                        elif(mode == base_note_increment + 9):
                            self.active_state.active_visualizer_effect = "alternate_color_shapes"
                        elif(mode == base_note_increment + 10):
                            self.active_state.active_visualizer_effect = "transition_color_shapes"
                        elif(mode == base_note_increment + 11):
                            self.visualizer.resetFrame()
                            self.active_state.active_visualizer_effect = "draw_line"
                        # GENERIC
                        elif(mode == base_note_increment + 12):
                            self.visualizer.old_full_intensity = 0
                            self.visualizer.old_fade_out_intensity = 0
                            self.active_state.active_visualizer_effect = "full_color"
                        elif(mode == base_note_increment + 13):
                            self.visualizer.old_full_intensity = 1
                            self.visualizer.old_fade_out_intensity = 1
                            self.active_state.active_visualizer_effect = "fade_out"
                        elif(mode == base_note_increment + 14):
                            self.active_state.active_visualizer_effect = "clear_frame"
                        elif(mode == base_note_increment + 15):
                            self.active_state.active_visualizer_effect = "fire"

                        # LOGGER
                        if(old_vizualizer_effect != self.active_state.active_visualizer_effect):
                            message = "is changing viz effect to -> " + \
                                self.active_state.active_visualizer_effect
                            self.logger(self.strip_config.name, message)

                    # MODIFIERS
                    if(mode >= base_note_increment + 16 and mode <= base_note_increment + 26):

                        if(mode == base_note_increment + 16):
                            self.active_state.is_reverse = not self.active_state.is_reverse
                            message = "is changing reverse mode to -> " + \
                                str(self.active_state.is_reverse)
                            self.logger(self.strip_config.name, message)

                        elif(mode == base_note_increment + 17):
                            self.active_state.is_mirror = not self.active_state.is_mirror
                            message = "is changing mirror mode to -> " + \
                                str(self.active_state.is_mirror)
                            self.logger(self.strip_config.name, message)

                        elif(mode == base_note_increment + 18):
                            self.active_state.division_value = self.valueUpdater(
                                self.active_state.division_value,
                                velocity,
                                4,
                                1
                            )
                            self.visualizer.initVizualiser()

                            message = "is changing shape to -> " + \
                                str(
                                    self.strip_config.shapes[self.active_state.division_value].shape)
                            self.logger(self.strip_config.name, message)

                        elif(mode == base_note_increment + 19):
                            self.active_state.active_color_scheme_index = self.valueUpdater(
                                self.active_state.active_color_scheme_index,
                                velocity,
                                self.active_state.number_of_color_schemes,
                                1
                            )
                            message = "is changing color scheme to -> " + \
                                str(
                                    self.active_state.color_schemes[self.active_state.active_color_scheme_index])
                            self.logger(self.strip_config.name, message)

                        elif(mode == base_note_increment + 20):
                            self.active_state.active_audio_channel_index = self.valueUpdater(
                                self.active_state.active_audio_channel_index,
                                velocity,
                                self.config.number_of_audio_ports,
                                1
                            )

                            message = "is changing audio port to -> " + \
                                str(
                                    self.config.audio_ports[self.active_state.active_audio_channel_index].name)
                            self.logger(self.strip_config.name, message)

                        elif(mode == base_note_increment + 21):

                            self.active_state.time_interval = convertRange(
                                velocity, [1, 127], [0, 500])
                            message = "is changing time_interval to -> " + \
                                str(self.active_state.time_interval)
                            self.logger(self.strip_config.name, message)

                        elif(mode == base_note_increment + 22):

                            self.active_state.max_brightness = convertRange(
                                velocity, [1, 127], [1, 255])
                            message = "is changing max_brightness to -> " + \
                                str(self.active_state.max_brightness)
                            self.logger(self.strip_config.name, message)

                        elif(mode == base_note_increment + 23):
                            self.active_state.chunk_size = convertRange(
                                velocity, [1, 127], [2, 50])
                            self.logger(
                                self.strip_config.name, "is chunk size to " + str(self.active_state.chunk_size))

                        elif(mode == base_note_increment + 24):
                            self.active_state.blur_value = convertRange(
                                velocity, [1, 127], [0.1, 8], rounded=False)
                            self.logger(
                                self.strip_config.name, "is changing blur value to " + str(self.active_state.blur_value))

                        elif(mode == base_note_increment + 25):
                            self.active_state.division_value = convertRange(
                                velocity, [1, 127], [0, 8], rounded=False)
                            self.logger(
                                self.strip_config.name, "is changing division value to " + str(self.active_state.division_value))

                        elif(mode == base_note_increment + 26):
                            self.visualizer.resetFrame()
                            self.strip_config.active_state_index = self.valueUpdater(
                                self.strip_config.active_state_index,
                                velocity,
                                len(self.config.states),
                                1
                            )

                            self.strip_config.active_state = deepcopy(
                                self.config.states[self.strip_config.active_state_index])
                            self.active_state = self.strip_config.active_state

                            self.visualizer.initVizualiser()

                            self.logger(self.strip_config.name, "is changing state for " +
                                        self.config.states[self.strip_config.active_state_index].name)

        return self.strip_config
