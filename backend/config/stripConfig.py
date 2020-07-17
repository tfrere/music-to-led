from inputs.midi import Midi
from inputs.audio import Audio
from outputs.serial import Serial

from config.shapeConfig import ShapeConfig

from config.helpers import subdivideShape


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
        original_physical_shape=[20, 20],
        scene=[],
        debug=False
    ):

        self.name = name
        self.serial_port_name = serial_port_name
        self.is_online = is_online
        self.midi_ports_for_changing_mode = midi_ports_for_changing_mode
        self.midi_ports_for_visualization = midi_ports_for_visualization
        self.original_physical_shape = original_physical_shape
        self.physical_shape = ShapeConfig(original_physical_shape)
        self.scene = scene

        self.shapes = []
        self.shapes.append(ShapeConfig(
            subdivideShape(original_physical_shape, 1)))
        self.shapes.append(ShapeConfig(
            subdivideShape(original_physical_shape, 2)))
        self.shapes.append(ShapeConfig(
            subdivideShape(original_physical_shape, 4)))
        self.shapes.append(ShapeConfig(
            subdivideShape(original_physical_shape, 8)))

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
        print("original_physical_shape -> ", self.original_physical_shape)
        print("physical_shape -> ", self.physical_shape)
        print("shapes -> ", self.shapes)
        print("active_state_index -> ", self.active_state_index)
        print("----------------")
        print("--")
