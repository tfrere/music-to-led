import time
import pyaudio
import numpy as np


class Audio:
    def __init__(
        self,
        port_name="port_name",
        min_frequency=200,
        max_frequency=12000,
        sampling_rate=44100,
        framerate=60
    ):
        """ Create a data stream from audio input """
        self.audio = pyaudio.PyAudio()
        self.sampling_rate = sampling_rate
        self.framerate = framerate
        self.overflows = 0
        self.data = []
        self.stream = 0
        self.prev_overflow_time = time.time()
        self.frames_per_buffer = int(self.sampling_rate / self.framerate)
        self.port_index = Audio.getPortIndexFromName(port_name)
        self.tryPort(port_name)
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self.sampling_rate,
            input=True,
            input_device_index=self.port_index,
            frames_per_buffer=self.frames_per_buffer
        )

    @staticmethod
    def tryPort(port_name):
        if(Audio.getPortIndexFromName(port_name) == -1):
            print(
                "Audio port not found or not acceptable, please check your config file -> ", port_name)
            list = []
            for item in Audio.listAvailablePortsInfos():
                if(item["maxInputChannels"] >= 2):
                    list.append(item["name"])
            print("Here's the audio ports available -> ", list)
            quit()

    @staticmethod
    def listAvailablePortsInfos():
        """ List available ports informations """
        audio = pyaudio.PyAudio()
        ports = []
        for i in range(audio.get_device_count()):
            ports.append(audio.get_device_info_by_index(i))
        return ports

    @staticmethod
    def getPortIndexFromName(name):
        """ Get port index from name

            input: Port's name
            returns: Index
        """
        audio = pyaudio.PyAudio()
        for i in range(audio.get_device_count()):
            info = audio.get_device_info_by_index(i)
            if(name == info["name"]):
                return info["index"]
        return -1

    @staticmethod
    def listAvailablePortsName():
        """List available ports names"""
        audio = pyaudio.PyAudio()
        ports = []
        for i in range(audio.get_device_count()):
            if(audio.get_device_info_by_index(i)["maxInputChannels"] >= 2):
                ports.append({"name": audio.get_device_info_by_index(
                    i)["name"], "index": audio.get_device_info_by_index(i)["index"]})
        return ports

    @staticmethod
    def printDeviceList():
        print('Audio ports available :')
        for port in Audio.listAvailablePortsName():
            print("- '" + port["name"] + "'")

    @staticmethod
    def printDeviceListWithInfo():
        print('Audio ports available :')
        for port in Audio.listAvailablePortsInfos():
            print(port)

    @staticmethod
    def testDevice(name):
        if(Audio.getPortIndexFromName(name) != -1):
            print('Audio tests test on port :')
            print(name)
            audioInput = Audio(name)
            while 1:
                data = audioInput.getRawData()
                print(data)
                print(len(data))
                time.sleep(1)
        else:
            print('This port is not available -> ' + name)

    def getRawData(self):
        """Return actual audio data"""
        try:
            self.data = np.fromstring(
                self.stream.read(
                    self.frames_per_buffer,
                    exception_on_overflow=False
                ),
                dtype=np.int16
            )
            self.data = self.data.astype(np.float32)
            self.stream.read(
                self.stream.get_read_available(),
                exception_on_overflow=False
            )
            return self.data
        except IOError:
            overflows += 1
            if time.time() > prev_overflow_time + 1:
                prev_overflow_time = time.time()
                print('Audio buffer has overflowed {} times'.format(overflows))

    def __del__(self):
        if(self.stream != 0):
            self.stream.stop_stream()
            self.stream.close()
            self.audio.terminate()


if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-l", "--list", help="list available audio devices", action="store_true")
    parser.add_argument("-i", "--list-with-infos",
                        help="list available audio devices with all informations", action="store_true")
    parser.add_argument(
        "-t", "--test", help="test a given audio port", type=str)

    args = parser.parse_args()

    if(args.list):
        Audio.printDeviceList()
    if(args.list_with_infos):
        Audio.printDeviceListWithInfo()
    if(args.test):
        Audio.testDevice(args.test)
