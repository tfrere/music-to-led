import yaml
import json
import sys
import os
import numpy as np
from copy import deepcopy

from helpers.time.timeSinceStart import TimeSinceStart
from helpers.color.colorSchemeFormatter import ColorSchemeFormatter

from visualizations.visualizer import Visualizer

from inputs.midi import Midi
from inputs.audio import Audio

from outputs.serial import Serial

import json


def isAnEvenArray(arr):
    for item in arr:
        if(item % 2 == 1):
            return False
    return True


def subdivideShape(shape, subdivision_level=1):
    """ input : shape array [37, 13, 42]
        output : split it subdivided shapes """

    newShape = []
    for i, value in enumerate(shape):
        newValue = value / subdivision_level
        for i in range(subdivision_level):
            newShape.append(int(newValue))

    return newShape


class AudioPortConfig():

    def __init__(
        self,
        name="Built-in Microphone",
        min_frequency=200,
        max_frequency=12000,
        sampling_rate=44000,
        number_of_audio_samples=24,
        min_volume_threshold=1e-7,
        n_rolling_history=4,
        debug=False
    ):

        self.name = name
        self.min_frequency = min_frequency
        self.max_frequency = max_frequency
        self.sampling_rate = sampling_rate
        self.number_of_audio_samples = number_of_audio_samples
        self.min_volume_threshold = float(min_volume_threshold)
        self.n_rolling_history = n_rolling_history

        if(debug):
            Audio.tryPort(name)

    def print(self):
        print("--")
        print("----------------")
        print("Audio Port Config : ")
        print("----------------")
        print("name -> ", self.name)
        print("min_frequency -> ", self.min_frequency)
        print("max_frequency -> ", self.max_frequency)
        print("sampling_rate -> ", self.sampling_rate)
        print("number_of_audio_samples -> ", self.number_of_audio_samples)
        print("min_volume_threshold -> ", self.min_volume_threshold)
        print("n_rolling_history -> ", self.n_rolling_history)
        print("----------------")
        print("--")


class ShapeConfig():

    def __init__(
        self,
        shape=[74, 74, 125, 125]
    ):

        self.shape = shape
        self.number_of_substrip = len(self.shape)
        self.number_of_pixels = 0
        for pixel_number in self.shape:
            self.number_of_pixels += pixel_number

        self.offsets = []
        for i, bock_size in enumerate(self.shape):
            if(i - 1 >= 0):
                self.offsets.append(bock_size + self.offsets[i - 1])
            else:
                self.offsets.append(bock_size)

    def print(self):
        print("--")
        print("----------------")
        print("Shape Config : ")
        print("----------------")
        print("shape -> ", self.shape)
        print("number_of_substrip -> ", self.number_of_substrip)
        print("number_of_pixels -> ", self.number_of_pixels)
        print("shape chunks offset -> ", self.offsets)
        print("----------------")
        print("--")


class StateConfig():

    def __init__(
        self,
        name="statename",
        max_brightness=120,
        active_visualizer_effect="scroll",
        division_value=0,
        active_audio_channel_index=0,
        audio_samples_filter_min=0,
        audio_samples_filter_max=24,
        is_reverse=False,
        time_interval=120,
        chunk_size=5,
        blur_value=4.0,
        is_mirror=False,
        active_color_scheme_index=0,
        color_schemes=[["#FF0000", "#00FF00"]],
        debug=False
    ):

        self.name = name
        self.active_audio_channel_index = active_audio_channel_index
        self.audio_samples_filter_min = audio_samples_filter_min
        self.audio_samples_filter_max = audio_samples_filter_max

        self.division_value = division_value
        self.active_visualizer_effect = active_visualizer_effect
        self.max_brightness = max_brightness

        self.time_interval = time_interval
        self.chunk_size = chunk_size
        self.blur_value = blur_value

        self.is_reverse = is_reverse
        self.is_mirror = is_mirror

        self.active_color_scheme_index = active_color_scheme_index
        self.color_schemes = color_schemes
        self.number_of_color_schemes = len(color_schemes)

        self.formatted_color_schemes = []
        colorSchemeFormatter = ColorSchemeFormatter()
        for scheme in self.color_schemes:
            self.formatted_color_schemes.append(
                colorSchemeFormatter.render(scheme))

    def copy(self):
        return StateConfig(
            self.name,
            self.max_brightness,
            self.active_visualizer_effect,
            self.division_value,
            self.active_audio_channel_index,
            self.audio_samples_filter_min,
            self.audio_samples_filter_max,
            self.is_reverse,
            self.time_interval,
            self.chunk_size,
            self.blur_value,
            self.is_mirror,
            self.active_color_scheme_index,
            self.color_schemes
        )

    def getJsonFromState(self):
        return json.dumps(self.__dict__, default=lambda o: o.__dict__, indent=4)

    def print(self):
        print("--")
        print("----------------")
        print("State Config : ")
        print("----------------")
        print("active_audio_channel_index -> ",
              self.active_audio_channel_index)
        print("audio_samples_filter_min -> ", self.audio_samples_filter_min)
        print("audio_samples_filter_max -> ", self.audio_samples_filter_max)
        print("max_brightness -> ", self.max_brightness)
        print("division_value -> ", self.division_value)
        print("active_visualizer_effect -> ", self.active_visualizer_effect)
        print("time_interval -> ", self.time_interval)
        print("chunk_size -> ", self.chunk_size)
        print("blur_value -> ", self.blur_value)
        print("is_reverse -> ", self.is_reverse)
        print("is_mirror -> ", self.is_mirror)
        print("color_schemes -> ", self.color_schemes)
        print("active_color_scheme_index -> ", self.active_color_scheme_index)
        print("formatted_color_schemes -> ", self.formatted_color_schemes)
        print("----------------")
        print("--")


class StripConfig():

    def __init__(
        self,
        name="strip",
        serial_port_name="/dev/tty.usbserial-14240",
        is_online=False,
        midi_ports_for_changing_mode=[],
        midi_ports_for_visualization=[],
        active_state_index=0,
        active_state=0,
        physical_shape=[20, 20],
        debug=False
    ):

        self.name = name
        self.serial_port_name = serial_port_name
        self.is_online = is_online
        self.midi_ports_for_changing_mode = midi_ports_for_changing_mode
        self.midi_ports_for_visualization = midi_ports_for_visualization
        self.physical_shape = ShapeConfig(physical_shape)

        self.shapes = []
        self.shapes.append(ShapeConfig(subdivideShape(physical_shape, 1)))
        self.shapes.append(ShapeConfig(subdivideShape(physical_shape, 2)))
        self.shapes.append(ShapeConfig(subdivideShape(physical_shape, 4)))
        self.shapes.append(ShapeConfig(subdivideShape(physical_shape, 8)))

        self.active_state_index = active_state_index
        self.active_state = active_state.copy()

        if(debug):
            Serial.tryPort(serial_port_name)
            if(midi_ports_for_visualization):
                for name in midi_ports_for_visualization:
                    Midi.tryPort(name)
            if(midi_ports_for_changing_mode):
                for name in midi_ports_for_changing_mode:
                    Midi.tryPort(name)

    def print(self):
        print("--")
        print("----------------")
        print("Strip Config : ")
        print("----------------")
        print("name -> ", self.name)
        print("serial_port_name -> ", self.serial_port_name)
        print("midi_ports_for_changing_mode -> ",
              self.midi_ports_for_changing_mode)
        print("midi_ports_for_visualization -> ",
              self.midi_ports_for_visualization)
        print("physical_shape -> ", self.physical_shape)
        print("shapes -> ", self.shapes)
        print("active_state_index -> ", self.active_state_index)
        print("----------------")
        print("--")


class Config():

    def __init__(
        self,
        desirated_framerate=60,
        display_interface=True,
        debug=False,
        audio_ports=[
            {
                "name": "Built-in Microphone",
                "min_frequency": 200,
                "max_frequency": 12000,
            }
        ],
        strips=[
            {
                "name": "default strip",
                "serial_port_name": "/dev/tty.usbserial-14210",
                "midi_ports_for_changing_mode": ["Audio2Led Center"],
                "midi_ports_for_visualization": ["Audio2Led Side"],
                "active_state_index": 0,
                "physical_shape": [50, 50]
            }
        ],
        states=[
            {
                "name": "default state",
                "active_visualizer_effect": "scroll",
                "active_audio_channel_index": 0,
                "audio_samples_filter_min": 0,
                "audio_samples_filter_max": 24,
                "is_reverse": False,
                "is_mirror": False,
                "max_brightness": 120,
                "division_value": 0,
                "time_interval": 120,
                "chunk_size": 5,
                "blur_value": 4.0,
            }
        ]
    ):

        self.desirated_framerate = desirated_framerate
        self.display_interface = display_interface
        self.delay_between_frames = 1 / desirated_framerate
        self.timeSinceStart = TimeSinceStart()
        self.audio_ports = []
        for audio_port in audio_ports:
            self.audio_ports.append(
                AudioPortConfig(
                    name=audio_port["name"],
                    min_frequency=audio_port["min_frequency"],
                    max_frequency=audio_port["max_frequency"],
                    debug=debug
                )
            )
        self.number_of_audio_ports = len(self.audio_ports)

        self.states = []
        for state in states:
            self.states.append(
                StateConfig(
                    name=state["name"],
                    active_audio_channel_index=state["active_audio_channel_index"],
                    audio_samples_filter_min=state["audio_samples_filter_min"],
                    audio_samples_filter_max=state["audio_samples_filter_max"],
                    max_brightness=state["max_brightness"],
                    active_visualizer_effect=state["active_visualizer_effect"],
                    division_value=state["division_value"],
                    color_schemes=state["color_schemes"],
                    active_color_scheme_index=state["active_color_scheme_index"],
                    time_interval=state["time_interval"],
                    chunk_size=state["chunk_size"],
                    blur_value=state["blur_value"],
                    is_mirror=state["is_mirror"],
                    is_reverse=state["is_reverse"],
                    debug=debug
                )
            )
        self.number_of_states = len(self.states)

        self.strips = []
        for strip in strips:
            self.strips.append(
                StripConfig(
                    name=strip["name"],
                    serial_port_name=strip["serial_port_name"],
                    is_online=False,
                    midi_ports_for_changing_mode=strip["midi_ports_for_changing_mode"],
                    midi_ports_for_visualization=strip["midi_ports_for_visualization"],
                    physical_shape=strip["physical_shape"],
                    active_state_index=strip["active_state_index"],
                    active_state=self.states[strip["active_state_index"]],
                    debug=debug
                )
            )
        self.number_of_strips = len(self.strips)

    def getJsonFromConfig(self):
        return json.dumps(self.__dict__, default=lambda o: o.__dict__, indent=4)

    # def saveToYmlFile():

    def print(self):
        print("--")
        print("----------------")
        print("Config : ")
        print("----------------")
        print("desirated_framerate -> ", self.desirated_framerate)
        print("display_interface -> ", self.display_interface)
        print("delay_between_frames -> ", self.delay_between_frames)
        for audio_port in self.audio_ports:
            audio_port.print()
        print("number_of_audio_ports -> ", self.number_of_audio_ports)
        for strip in self.strips:
            strip.print()
        print("number_of_strips -> ", self.number_of_strips)
        for state in self.states:
            state.print()
        print("number_of_states -> ", self.number_of_states)
        print("----------------")
        print("--")


class ConfigLoader():
    """ Load and instanciate settings class from settings file """

    def __init__(self, file, debug=False):
        ConfigLoader.testFilePath(file)
        with open(file, 'r') as stream:
            try:

                file = yaml.load(
                    stream,
                    Loader=yaml.FullLoader
                )

                self.data = Config(
                    desirated_framerate=file["desirated_framerate"],
                    display_interface=file["display_interface"],
                    audio_ports=file["audio_ports"],
                    strips=file["strips"],
                    states=file["states"],
                    debug=debug
                )

            except yaml.YAMLError as exc:
                print(exc)

    def findStripIndexByStripName(self, name):
        for i, strip in enumerate(self.data.strips):
            if(name == strip.name):
                return i
        return -1

    @staticmethod
    def testFilePath(path):
        try:
            open(path)
        except IOError:
            print("Cannot load this config file. Please check your path.")
            quit()

    @staticmethod
    def testConfig(path=os.path.abspath(os.path.dirname(sys.argv[0])) + '/../CONFIG.yml', verbose=True):

        try:
            config = ConfigLoader(path, debug=verbose)
            if(verbose):
                config.data.print()
        except TypeError:
            print("└-> ERR : Cannot load. This config file may be corrupted. Exiting.")
            quit()
        print("└-> Congrats, your config file is valid !")


if __name__ == "__main__":

    config = ConfigLoader.testConfig(verbose=True)
