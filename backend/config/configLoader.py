import yaml
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

from config.audioConfig import AudioConfig
from config.shapeConfig import ShapeConfig
from config.stateConfig import StateConfig
from config.stripConfig import StripConfig


def my_yaml_dump(yaml_obj):
    my_ob = deepcopy(yaml_obj)
    for item in dir(my_ob):
        if item.startswith("_") and not item.startswith("__"):
            del my_ob.__dict__[item]
    return yaml.dump(my_ob)

# remove class tags from yml output


def noop(self, *args, **kw):
    pass


yaml.emitter.Emitter.process_tag = noop


class Config():

    def __init__(
        self,
        file_name="SAMPLE_CONFIG.yml",
        desirated_framerate=60,
        display_shell_interface=True,
        is_zmq_api_enabled=True,
        debug=False,
        scene=[],
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
                "original_physical_shape": [50, 50],
                "scene": []
            }
        ],
        states=[
            {
                "name": "default state",
                "active_visualizer_effect": "clear_frame",
                "active_audio_channel_index": 0,
                "audio_samples_filter_min": 0,
                "audio_samples_filter_max": 24,
                "audio_gain": 1,
                "color_schemes": ["red", "green", "blue"],
                "audio_decay": 1,
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

        self.file_name = file_name
        self.desirated_framerate = desirated_framerate
        self.display_shell_interface = display_shell_interface
        self.is_zmq_api_enabled = is_zmq_api_enabled
        self.delay_between_frames = 1 / desirated_framerate
        self.timeSinceStart = TimeSinceStart()
        self.audio_ports = []
        for audio_port in audio_ports:
            self.audio_ports.append(
                AudioConfig(
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
                    audio_gain=state["audio_gain"],
                    audio_decay=state["audio_decay"],
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
                    scene=strip["scene"],
                    original_physical_shape=strip["original_physical_shape"],
                    active_state_index=strip["active_state_index"],
                    active_state=self.states[strip["active_state_index"]],
                    debug=debug
                )
            )
        self.number_of_strips = len(self.strips)

    def saveToYmlFile(self):
        with open(self.file_name, "w") as fileDescriptor:
            yaml.dump(self, fileDescriptor)

    def print(self):
        print("--")
        print("----------------")
        print("Config : ")
        print("----------------")
        print("file_name -> ", self.file_name)
        print("desirated_framerate -> ", self.desirated_framerate)
        print("display_shell_interface -> ", self.display_shell_interface)
        print("is_zmq_api_enabled -> ", self.is_zmq_api_enabled)
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

    def __init__(self, fileName, debug=False):
        ConfigLoader.testFilePath(fileName)
        with open(fileName, 'r') as stream:
            try:
                file = yaml.load(
                    stream,
                    Loader=yaml.FullLoader
                )

                self.data = Config(
                    file_name=fileName,
                    desirated_framerate=file["desirated_framerate"],
                    display_shell_interface=file["display_shell_interface"],
                    is_zmq_api_enabled=file["is_zmq_api_enabled"],
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

    toto = ConfigLoader()

    config = ConfigLoader.testConfig(verbose=True)
