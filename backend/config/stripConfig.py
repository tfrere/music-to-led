from inputs.midi import Midi
from inputs.audio import Audio
from outputs.serial.main import Serial

from config.shapeConfig import ShapeConfig
from config.stateConfig import StateConfig

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
        midi_range=[0, 10],
        states=[],
        debug=False,
        verbose=False
    ):

        self.name = name
        self.serial_port_name = serial_port_name
        self.active_state_index = active_state_index
        self.is_online = is_online
        self.midi_ports_for_changing_mode = midi_ports_for_changing_mode
        self.midi_ports_for_visualization = midi_ports_for_visualization
        self.original_physical_shape = original_physical_shape
        self._physical_shape = ShapeConfig(original_physical_shape)
        self.midi_range = midi_range
        self.scene = scene

        self._shapes = []
        self._shapes.append(ShapeConfig(
            subdivideShape(original_physical_shape, 1)))
        self._shapes.append(ShapeConfig(
            subdivideShape(original_physical_shape, 2)))
        self._shapes.append(ShapeConfig(
            subdivideShape(original_physical_shape, 4)))
        self._shapes.append(ShapeConfig(
            subdivideShape(original_physical_shape, 8)))

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
                    active_color_scheme_index=state["active_color_scheme_index"],
                    time_interval=state["time_interval"],
                    chunk_size=state["chunk_size"],
                    blur_value=state["blur_value"],
                    is_mirror=state["is_mirror"],
                    is_reverse=state["is_reverse"],
                    debug=debug,
                    verbose=verbose
                )
            )
        if (len(self.states) == 0):
            self.states.append(StateConfig())

        self.active_state = self.states[active_state_index].copy()
        self._number_of_states = len(self.states)

        if(debug):
            # Serial.tryPort(serial_port_name)
            if(midi_ports_for_visualization):
                for name in midi_ports_for_visualization:
                    Midi.tryPort(name)
            if(midi_ports_for_changing_mode):
                for name in midi_ports_for_changing_mode:
                    Midi.tryPort(name)

        if(verbose):
            self.print()

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
        print("physical_shape -> ", self._physical_shape)
        print("midi_range -> ", self.midi_range)
        print("shapes -> ", self._shapes)
        print("active_state_index -> ", self.active_state_index)
        print("----------------")
        print("--")
