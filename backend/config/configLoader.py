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

from config.helpers import autoKill

# remove class tags from yml output


def noop(self, *args, **kw):
    pass


yaml.emitter.Emitter.process_tag = noop


class Config():

    def __init__(
        self,
        file_name="CONFIG.yml",
        desirated_framerate=60,
        display_shell_interface=True,
        is_zmq_api_enabled=True,
        debug=False,
        verbose=False,
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
                "scene": [],
                "states": []
            }
        ]
    ):

        self.file_name = file_name
        self.desirated_framerate = desirated_framerate
        self.display_shell_interface = display_shell_interface
        self.is_zmq_api_enabled = is_zmq_api_enabled
        self._delay_between_frames = 1 / desirated_framerate
        self._timeSinceStart = TimeSinceStart()
        self._audio_ports = []
        self.audio_ports = audio_ports
        for audio_port in audio_ports:
            self._audio_ports.append(
                AudioConfig(
                    name=audio_port["name"],
                    min_frequency=audio_port["min_frequency"],
                    max_frequency=audio_port["max_frequency"],
                    debug=debug,
                    verbose=verbose
                )
            )
        self._number_of_audio_ports = len(self._audio_ports)

        self._strips = []
        self.strips = strips
        for strip in strips:
            self._strips.append(
                StripConfig(
                    name=strip["name"],
                    serial_port_name=strip["serial_port_name"],
                    is_online=False,
                    midi_ports_for_changing_mode=strip["midi_ports_for_changing_mode"],
                    midi_ports_for_visualization=strip["midi_ports_for_visualization"],
                    scene=strip["scene"],
                    states=strip["states"],
                    original_physical_shape=strip["original_physical_shape"],
                    active_state_index=strip["active_state_index"],
                    active_state=strip["states"][strip["active_state_index"]],
                    debug=debug,
                    verbose=verbose
                )
            )
        self._number_of_strips = len(self._strips)

    def saveToYmlFile(self):
        print(self.file_name)
        with open(self.file_name, "w") as fileDescriptor:
            obj_to_save = deepcopy(self)
            obj_to_save.strips = deepcopy(obj_to_save._strips)
            for strip in obj_to_save.strips:
                for sub in dir(strip):
                    if sub.startswith("_") and not sub.startswith("__"):
                        del strip.__dict__[sub]
                for state in strip.states:
                    for sub in dir(state):
                        if sub.startswith("_") and not sub.startswith("__"):
                            del state.__dict__[sub]
            for item in dir(obj_to_save):
                if item.startswith("_") and not item.startswith("__"):
                    del obj_to_save.__dict__[item]

            return yaml.dump(obj_to_save, fileDescriptor, sort_keys=False)

    def print(self):
        print("--")
        print("----------------")
        print("Config : ")
        print("----------------")
        print("file_name -> ", self.file_name)
        print("desirated_framerate -> ", self.desirated_framerate)
        print("display_shell_interface -> ", self.display_shell_interface)
        print("is_zmq_api_enabled -> ", self.is_zmq_api_enabled)
        print("delay_between_frames -> ", self._delay_between_frames)
        for audio_port in self._audio_ports:
            audio_port.print()
        print("number_of_audio_ports -> ", self._number_of_audio_ports)
        for strip in self._strips:
            strip.print()
        print("number_of_strips -> ", self._number_of_strips)
        print("----------------")
        print("--")


class ConfigLoader():
    """ Load and instanciate settings class from settings file """

    def __init__(self, fileName, debug=False, verbose=False):
        ConfigLoader.testFilePath(fileName)
        with open(fileName, 'r') as stream:
            try:
                file = yaml.load(
                    stream,
                    Loader=yaml.FullLoader
                )

                if(not "desirated_framerate" in file
                   or not "display_shell_interface" in file
                   or not "is_zmq_api_enabled" in file
                   or not "audio_ports" in file
                   or not "strips" in file):
                    raise TypeError("Not a valid config file.")

                self.data = Config(
                    file_name=fileName,
                    desirated_framerate=file["desirated_framerate"],
                    display_shell_interface=file["display_shell_interface"],
                    is_zmq_api_enabled=file["is_zmq_api_enabled"],
                    audio_ports=file["audio_ports"],
                    strips=file["strips"],
                    debug=debug,
                    verbose=verbose
                )
            except TypeError as err:
                print("└-> Cannot load. " + err.args[0])
                autoKill()

            except yaml.YAMLError as err:
                print("└-> Cannot load. " + err.args[0])
                autoKill()

    def findStripIndexByStripName(self, name):
        for i, strip in enumerate(self.data._strips):
            if(name == strip.name):
                return i
        return -1

    @staticmethod
    def testFilePath(path):
        try:
            open(path)
        except IOError as err:
            print("└-> Cannot load. " + err.args[0])
            autoKill()

    @staticmethod
    def testConfig(path=os.path.abspath(os.path.dirname(sys.argv[0])) + '/../CONFIG.yml', debug=True, verbose=False):
        try:
            if(not ".yml" in path):
                raise TypeError("Only .yml are valid files")
            config = ConfigLoader(path, debug=debug, verbose=verbose)
            if(verbose):
                config.data.print()
        except TypeError as err:
            print("└-> Cannot load. " + err.args[0])
            autoKill()
        print("└-> Congrats, your config file is valid !")


if __name__ == "__main__":

    ConfigLoader.testConfig(debug=True, verbose=True)
