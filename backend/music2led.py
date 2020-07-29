import sys
import signal
import psutil
import subprocess
import os
import time
import multiprocessing
import argparse
import setproctitle
import concurrent.futures
from multiprocessing import Pool
import numpy as np
from copy import deepcopy

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
from visualizations.pixelReshaper import PixelReshaper
from visualizations.modSwitcher import ModSwitcher


def kill_proc_tree(pid, frame):
    print("└-> Bye !")
    if(config.display_shell_interface and shellInterface):
        shellInterface.clearTerminal()
    parent = psutil.Process(os.getpid())
    children = parent.children(recursive=False)
    for child in children:
        child.kill()
    gone, still_alive = psutil.wait_procs(children, timeout=5)
    parent.kill()
    parent.wait(5)


signal.signal(signal.SIGINT, kill_proc_tree)
signal.signal(signal.SIGTERM, kill_proc_tree)


def zmqProcess(shared_list):
    setproctitle.setproctitle("music-2-led - zmq api")

    host = 'tcp://127.0.0.1:8000'
    print('└-> Init zmq socket process running on : {}'.format(host))
    server = ZmqServer(host)

    while True:
        server.socket.send_string(server.computeInfos(shared_list))
        time.sleep(0.050)


def audioProcess(shared_list):
    setproctitle.setproctitle("music-2-led - audio process")

    config = shared_list[0]
    ports = ""
    for port in config._audio_ports:
        ports += port.name + " "
    print("└-> Init Audio process on ports : ", ports)

    audioDispatcher = AudioDispatcher(
        audio_ports=config._audio_ports,
        framerate=config.desirated_framerate
    )

    while 1:
        config = shared_list[0]

        audioDispatcher.dispatch()
        shared_list[1] = audioDispatcher.audio_datas


def serialProcess(index, shared_list):

    config = shared_list[0]
    audio_datas = shared_list[1]
    strip_config = config._strips[index]
    active_state = strip_config.states[strip_config.active_state_index]

    serial_port_name = strip_config.serial_port_name
    number_of_pixels = strip_config._shapes[active_state.division_value]._number_of_pixels

    setproctitle.setproctitle(
        "music-2-led - serial process - " + serial_port_name)
    print("└-> Init Serial process on port : ", serial_port_name)

    serial = Serial(
        number_of_pixels=number_of_pixels,
        port=serial_port_name
    )

    i = 0

    while 1:
        config = shared_list[0]
        shared_list[2 + config._number_of_strips +
                    index] = serial.isOnline()
        serial.update(
            shared_list[2 + index][0]
        )


def stripProcess(index, shared_list):

    config = shared_list[0]
    audio_datas = shared_list[1]
    strip_config = config._strips[index]
    active_state = strip_config.states[strip_config.active_state_index]
    strip_config._midi_logs = []

    setproctitle.setproctitle(
        "music-2-led - strip process - " + strip_config.name)
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
        verbose=not config.display_shell_interface
    )

    while 1:
        config = shared_list[0]

        visualizer.audio_datas = shared_list[1]

        midiDispatcher.dispatch()

        modSwitcher.midi_datas = midiDispatcher.midi_datas_for_changing_mode
        visualizer.midi_datas = midiDispatcher.midi_datas_for_visualization

        # Updating midi logs
        strip_config._midi_logs += midiDispatcher.midi_datas_for_changing_mode
        strip_config._midi_logs += midiDispatcher.midi_datas_for_visualization
        while(len(strip_config._midi_logs) > 5):
            strip_config._midi_logs.pop(0)

        strip_config = modSwitcher.changeMod()
        active_state = strip_config.active_state

        pixels = visualizer.drawFrame()
        pixels = visualizer.applyMaxBrightness(
            pixels, active_state.max_brightness)

        shared_list[2 + index] = [pixels, strip_config,
                                  active_state, framerateCalculator.getFps()]

        time.sleep(config._delay_between_frames)


if __name__ == "__main__":

    # for windows
    multiprocessing.freeze_support()

    setproctitle.setproctitle("music-2-led - main process")

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
        # configLoader = ConfigLoader(args.with_config_file, debug=False)
        # configLoader.data.saveToYmlFile()
        ConfigLoader.testConfig(path=args.test_config_file, debug=True)

    elif((not len(sys.argv) > 1) or (len(sys.argv) > 1 and args.with_config_file)):

        print("- Launching with : " + args.with_config_file)

        print("- Parsing and testing config file...", "")

        configLoader = ConfigLoader(args.with_config_file, debug=False)

        config = configLoader.data
        number_of_strips = config._number_of_strips

        manager = multiprocessing.Manager()
        shared_list = manager.list()

        # Shared list :
        # 0     : Config
        # 1     : Audio datas
        # 2...n : [pixels, strip_config, active_state, framerateCalculator.getFps()]
        # 2 + config._number_of_strips + ...n : isOnline for each strip

        shared_list.append(config)

        shared_list.append(np.tile(0., (config._number_of_audio_ports, 24)))

        for i in range(config._number_of_strips):
            shared_list.append(
                [np.tile(0., (config._number_of_audio_ports, 24)), config._strips[0], 0, False])

        for i in range(config._number_of_strips):
            shared_list.append(False)

        max_workers = multiprocessing.cpu_count()
        number_of_workers = config._number_of_strips * 2 + 3

        print("- Starting " + str(number_of_workers) +
              " sub-processes... ( on " + str(max_workers) + " physical cores available )")

        with concurrent.futures.ProcessPoolExecutor(
            max_workers=number_of_workers
        ) as executor:

            executor.submit(audioProcess, shared_list)
            if(config.is_zmq_api_enabled):
                executor.submit(zmqProcess, shared_list)

            for i in range(config._number_of_strips):
                executor.submit(stripProcess, i, shared_list)
                executor.submit(serialProcess, i, shared_list)

            time.sleep(1)
            print("-- Program successfully launched !")
            time.sleep(1)

            if(config.display_shell_interface):

                time.sleep(1)
                print("└-> Starting console GUI...")
                time.sleep(1)

                shellInterface = ShellInterface(config)

                while 1:
                    shellInterface.drawFrame(shared_list)
                    time.sleep(0.05)
