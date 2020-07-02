# This file is for debugging purpose

import sys
import os
import struct
import serial
import time
import glob
import multiprocessing
import logging
import argparse
import concurrent.futures
from multiprocessing import Pool
import numpy as np

from config.configLoader import ConfigLoader

from helpers.time.timeSinceStart import TimeSinceStart
from helpers.time.framerateCalculator import FramerateCalculator

from helpers.midiDispatcher import MidiDispatcher
from helpers.audioDispatcher import AudioDispatcher

from inputs.audio import Audio
from inputs.midi import Midi
from outputs.serial import Serial

from visualizations.visualizer import Visualizer
from visualizations.pixelReshaper import PixelReshaper
from visualizations.modSwitcher import ModSwitcher

parser = argparse.ArgumentParser()

parser.add_argument(
    "-v",
    "--visualizer-effect",
    help="Override visualizer effect.",
)

args = parser.parse_args()

visualizer_effect = "scroll"

if(args.visualizer_effect):
    visualizer_effect = args.visualizer_effect


ConfigLoader.testConfig(path="./CONFIG.yml", verbose=False)
configLoader = ConfigLoader("./CONFIG.yml")

strip_name = "strip test"

print("Launching -> ", strip_name)

config = configLoader.data
index = configLoader.findStripIndexByStripName(strip_name)
strip_config = config.strips[index]
active_state = strip_config.active_state

if(visualizer_effect != ""):
    active_state.active_visualizer_effect = visualizer_effect

audioDispatcher = AudioDispatcher(
    audio_ports=config.audio_ports,
    framerate=config.desirated_framerate
)

framerateCalculator = FramerateCalculator(config.desirated_framerate)

midi_ports_for_changing_mode = strip_config.midi_ports_for_changing_mode
midi_ports_for_visualization = strip_config.midi_ports_for_visualization

midiDispacther = MidiDispatcher(
    midi_ports_for_changing_mode,
    midi_ports_for_visualization
)

serial_port_name = config.strips[index].serial_port_name
number_of_pixels = active_state.shapes[active_state.active_shape_index].number_of_pixels

serial = Serial(
    number_of_pixels=number_of_pixels,
    port=serial_port_name
)

visualizer = Visualizer(
    config,
    index
)

modSwitcher = ModSwitcher(
    visualizer,
    config,
    index,
    True
)

while 1:

    audioDispatcher.dispatch()
    midiDispacther.dispatch()

    visualizer.audio_datas = audioDispatcher.audio_datas
    modSwitcher.midi_datas = midiDispacther.midi_datas_for_changing_mode
    visualizer.midi_datas = midiDispacther.midi_datas_for_visualization

    strip_config = modSwitcher.changeMod()

    pixels = visualizer.drawFrame()

    serial.update(
        pixels
    )
