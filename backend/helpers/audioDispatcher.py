import numpy as np

from inputs.audio import Audio

from helpers.audio.audioProcessing import AudioProcessing


class AudioDispatcher():
    def __init__(
        self,
        audio_ports={},
        framerate=60
    ):
        self.framerate = framerate
        self._audio_ports = audio_ports
        self._number_of_audio_ports = len(audio_ports)
        self.audio_datas = []
        self.audio_input_classes = []
        self.audio_processors = []
        for audio_port in self._audio_ports:
            self.audio_input_classes.append(
                Audio(
                    port_name=audio_port.name,
                    min_frequency=audio_port.min_frequency,
                    max_frequency=audio_port.max_frequency,
                    sampling_rate=audio_port.sampling_rate,
                    framerate=self.framerate
                )
            )
            self.audio_processors.append(
                AudioProcessing(
                    sampling_rate=audio_port.sampling_rate,
                    number_of_audio_samples=audio_port.number_of_audio_samples,
                    min_frequency=audio_port.min_frequency,
                    max_frequency=audio_port.max_frequency,
                    min_volume_threshold=audio_port.min_volume_threshold,
                    framerate=self.framerate
                )
            )

    def dispatch(self):
        self.audio_datas = []
        for i in range(self._number_of_audio_ports):
            self.audio_datas.append(
                self.audio_processors[i].render(
                    self.audio_input_classes[i].getRawData()
                )
            )
