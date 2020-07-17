import mido
import mido.backends.rtmidi


class Midi:
    def __init__(self, port_name):
        """ Create a data stream from midi input """
        self.notes = []
        self.port = 0
        self.port_name = port_name
        try:
            self.port = mido.open_input(self.port_name)
        except IOError:
            time.sleep(5)
            self.port = mido.open_input(self.port_name)

    @staticmethod
    def tryPort(port_name):
        try:
            port = mido.open_input(port_name)
            port.close()
        except IOError:
            print("Midi port not available -> ", port_name)
            quit()

    @staticmethod
    def listAvailablePortsName():
        """ List avaiable ports names """
        return mido.get_output_names()

    @staticmethod
    def printDeviceList():
        print('Midi ports available :')
        ports = Midi.listAvailablePortsName()
        for port in ports:
            print("- '" + port + "'")

    @staticmethod
    def testDevice(name):
        Midi.tryPort(name)
        print('Midi tests test on port :')
        print(name)

        midiClass = Midi(name)

        while 1:
            notes = []

            notes = midiClass.getRawData()

            if(notes != []):
                print(notes)

    def getRawData(self):
        """ Return actual midi data """
        self.notes = []
        if(self.port.iter_pending()):
            for msg in self.port.iter_pending():
                if(hasattr(msg, 'data')):
                    # SYSEX MESSAGES
                    message = bytearray(msg.data).decode("utf-8").split(":")
                    messageAction = message[0].strip()[1:]
                    messageData = message[1].strip()
                    self.notes.append(
                        {"port": self.port_name, "type": "sysex", "action": messageAction, "data": messageData})
                if(hasattr(msg, 'type') and (msg.type == "pitchwheel") and msg.pitch):
                    self.notes.append(
                        {"port": self.port_name, "type": msg.type, "pitch": msg.pitch})
                if(hasattr(msg, 'type') and (msg.type == "control_change") and msg.value and msg.control):
                    self.notes.append(
                        {"port": self.port_name, "type": msg.type, "value": msg.value, "control": msg.control})
                if(hasattr(msg, 'note') and hasattr(msg, 'type') and (msg.type == "note_on" or msg.type == "note_off") and hasattr(msg, 'velocity')):
                    message_type = "note_on" if msg.velocity > 0 else "note_ff"
                    self.notes.append(
                        {"port": self.port_name, "type": msg.type, "note": msg.note, "velocity": msg.velocity})
        return self.notes

    def __del__(self):
        if(self.port != 0):
            self.port.close()


if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-l", "--list", help="list available midi devices", action="store_true")
    parser.add_argument(
        "-t", "--test", help="test a given midi port", type=str)

    args = parser.parse_args()

    if(args.list):
        Midi.printDeviceList()

    if(args.test):
        Midi.testDevice(args.test)
