import sys
import os
import time
import multiprocessing
import argparse
import setproctitle
import concurrent.futures
from multiprocessing import Pool
import numpy as np

from config.configLoader import ConfigLoader

from gui.shellInterface import ShellInterface

from helpers.time.timeSinceStart import TimeSinceStart
from helpers.time.framerateCalculator import FramerateCalculator

from helpers.midiDispatcher import MidiDispatcher
from helpers.audioDispatcher import AudioDispatcher

from inputs.audio import Audio
from inputs.midi import Midi
from outputs.serial import Serial
from outputs.zmq.zmqServer import ZmqServer

from visualizations.visualizer import Visualizer
from visualizations.modSwitcher import ModSwitcher


def zerorpcProcess(shared_list):
    addr = 'tcp://127.0.0.1:8000'
    print('└-> Init zeromq socket process running on : {}'.format(addr))
    server = ZmqServer(addr, shared_list)
    server.launch()


def audioProcess(shared_list):

    config = shared_list[0]
    ports = ""
    for port in config.audio_ports:
        ports += port.name + " "
    print("└-> Init Audio process on ports : ", ports)

    audioDispatcher = AudioDispatcher(
        audio_ports=config.audio_ports,
        framerate=config.desirated_framerate
    )

    while 1:

        audioDispatcher.dispatch()
        shared_list[1] = audioDispatcher.audio_datas


def serialProcess(index, shared_list):

    config = shared_list[0]
    audio_datas = shared_list[1]
    strip_config = config.strips[index]
    active_state = config.states[strip_config.active_state_index]

    serial_port_name = strip_config.serial_port_name
    number_of_pixels = active_state.shapes[active_state.active_shape_index].number_of_pixels

    print("└-> Init Serial process on port : ", serial_port_name)

    serial = Serial(
        number_of_pixels=number_of_pixels,
        port=serial_port_name
    )

    i = 0

    while 1:
        shared_list[2 + config.number_of_strips +
                    index] = serial.isOnline()
        serial.update(
            shared_list[2 + index][0]
        )


def stripProcess(index, shared_list):

    config = shared_list[0]
    strip_config = config.strips[index]
    active_state = config.states[strip_config.active_state_index]
    audio_datas = shared_list[1]
    strip_config.midi_logs = []

    print("└-> Init strip process : ", strip_config.name)

    framerateCalculator = FramerateCalculator(config.desirated_framerate)

    midi_ports_for_changing_mode = strip_config.midi_ports_for_changing_mode
    midi_ports_for_visualization = strip_config.midi_ports_for_visualization

    midiDispatcher = MidiDispatcher(
        midi_ports_for_changing_mode,
        midi_ports_for_visualization
    )

    visualizer = Visualizer(
        config,
        index
    )

    modSwitcher = ModSwitcher(
        visualizer,
        config,
        index,
        verbose=not config.display_interface
    )

    while 1:

        visualizer.audio_datas = shared_list[1]

        midiDispatcher.dispatch()

        modSwitcher.midi_datas = midiDispatcher.midi_datas_for_changing_mode
        visualizer.midi_datas = midiDispatcher.midi_datas_for_visualization

        # Updating midi logs
        strip_config.midi_logs += midiDispatcher.midi_datas_for_changing_mode
        strip_config.midi_logs += midiDispatcher.midi_datas_for_visualization
        if(len(strip_config.midi_logs) > 10):
            strip_config.midi_logs.pop(0)

        strip_config = modSwitcher.changeMod()
        active_state = strip_config.active_state

        pixels = visualizer.drawFrame()
        pixels = visualizer.applyMaxBrightness(
            pixels, active_state.max_brightness)

        shared_list[2 + index] = [pixels, strip_config,
                                  active_state, framerateCalculator.getFps()]

        time.sleep(config.delay_between_frames)


if __name__ == "__main__":

    # for windows
    multiprocessing.freeze_support()

    setproctitle.setproctitle("music-2-led")

    parser = argparse.ArgumentParser()

    parser.add_argument(
        "-l",
        "--list-devices",
        help="List available devices.",
        action="store_true"
    )

    parser.add_argument(
        "-a",
        "--test-audio-device",
        help="Test a given audio port.",
        type=str,
        metavar="PORT_NAME"
    )
    parser.add_argument(
        "-m",
        "--test-midi-device",
        help="Test a given midi port.",
        type=str,
        metavar="PORT_NAME"
    )
    parser.add_argument(
        "-s",
        "--test-serial-device",
        help="Test a given serial port.",
        type=str,
        metavar="PORT_NAME"
    )
    parser.add_argument(
        "--test-config-file",
        help="Test a given config file. If your type \"\", it will test the default config file.",
        metavar="FILE_PATH"
    )

    parser.add_argument(
        "--single-strip",
        help="Launch on the first strip.",
        type=str
    )

    parser.add_argument(
        "--with-config-file",
        help="Launch with spectific config file.",
        type=str,
        default=os.path.abspath(os.path.dirname(sys.argv[0])) + '/CONFIG.yml',
        metavar="FILE_PATH"
    )

    args = parser.parse_args()

    if(args.list_devices):
        Audio.printDeviceList()
        Midi.printDeviceList()
        Serial.printDeviceList()

    elif(args.test_audio_device):
        Audio.testDevice(args.test_audio_device)

    elif(args.test_midi_device):
        Midi.testDevice(args.test_midi_device)

    elif(args.test_serial_device):
        Serial.testDevice(args.test_serial_device)

    elif(args.test_config_file):
        ConfigLoader.testConfig(path=args.test_config_file, verbose=False)

    elif((not len(sys.argv) > 1) or (len(sys.argv) > 1 and args.with_config_file)):

        print("- Launching with : " + args.with_config_file)

        print("- Parsing and testing config file...", "")

        ConfigLoader.testConfig(path=args.with_config_file, verbose=False)
        configLoader = ConfigLoader(args.with_config_file, debug=False)

        config = configLoader.data
        number_of_strips = config.number_of_strips

        manager = multiprocessing.Manager()
        shared_list = manager.list()

        # Shared list :
        # 0     : Config
        # 1     : Audio datas
        # 2...n : [pixels, strip_config, active_state, framerateCalculator.getFps()]
        # 2 + config.number_of_strips + ...n : isOnline for each strip

        shared_list.append(config)

        shared_list.append(np.tile(0., (config.number_of_audio_ports, 24)))

        for i in range(config.number_of_strips):
            shared_list.append(
                [np.tile(0., (config.number_of_audio_ports, 24)), config.strips[0], 0, False])

        for i in range(config.number_of_strips):
            shared_list.append(False)

        max_workers = multiprocessing.cpu_count()
        number_of_workers = config.number_of_strips * 2 + 3

        print("- Starting " + str(number_of_workers) +
              " sub-processes... ( on " + str(max_workers) + " physical cores available )")

        try:

            with concurrent.futures.ProcessPoolExecutor(
                max_workers=number_of_workers
            ) as executor:

                executor.submit(audioProcess, shared_list)
                executor.submit(zerorpcProcess, shared_list)

                for i in range(config.number_of_strips):
                    executor.submit(stripProcess, i, shared_list)
                    executor.submit(serialProcess, i, shared_list)

                if(config.display_interface):

                    time.sleep(1)
                    print("└-> Starting console GUI...")
                    time.sleep(1)

                    shellInterface = ShellInterface(config)

                    while 1:
                        shellInterface.drawFrame(shared_list)
                        time.sleep(0.05)

        except KeyboardInterrupt:
            print("└-> Bye !")
            if(config.display_interface):
                shellInterface.clearTerminal()
            sys.exit()
