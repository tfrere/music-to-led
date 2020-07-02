from inputs.midi import Midi


class MidiDispatcher():
    def __init__(self, midi_ports_for_changing_mode, midi_ports_for_visualization):
        self.midi_ports_for_changing_mode = midi_ports_for_changing_mode
        self.midi_ports_for_visualization = midi_ports_for_visualization
        self.midi_input_classes = []
        self.midi_datas = []
        self.midi_datas_for_visualization = []
        self.midi_datas_for_changing_mode = []

        if(self.midi_ports_for_changing_mode):
            for midi_port_for_changing_mode in self.midi_ports_for_changing_mode:
                self.midi_input_classes.append(
                    Midi(midi_port_for_changing_mode))
        if(self.midi_ports_for_visualization):
            for midi_port in self.midi_ports_for_visualization:
                self.midi_input_classes.append(Midi(midi_port))

    def dispatch(self):
        self.midi_datas = []
        self.midi_datas_for_visualization = []
        self.midi_datas_for_changing_mode = []
        for i, midi_input_class in enumerate(self.midi_input_classes):
            self.midi_datas = self.midi_input_classes[i].getRawData()
            if(self.midi_datas):
                for midi_note in self.midi_datas:
                    if(self.midi_ports_for_changing_mode):
                        for channel in self.midi_ports_for_changing_mode:
                            if(midi_note["port"] == channel and midi_note["type"] != "note_off"):
                                self.midi_datas_for_changing_mode.append(
                                    midi_note)
                    if(self.midi_ports_for_visualization):
                        for channel in self.midi_ports_for_visualization:
                            if(midi_note["port"] == channel):
                                self.midi_datas_for_visualization.append(
                                    midi_note)
