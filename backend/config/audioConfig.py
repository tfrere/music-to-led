from inputs.audio import Audio


from config.helpers import autoKill


class AudioConfig():

    def __init__(
        self,
        name="Built-in Microphone",
        min_frequency=200,
        max_frequency=12000,
        sampling_rate=44000,
        number_of_audio_samples=24,
        min_volume_threshold=1e-7,
        n_rolling_history=4,
        debug=False,
        verbose=False
    ):

        self.name = name
        self.min_frequency = min_frequency
        self.max_frequency = max_frequency
        self.sampling_rate = sampling_rate
        self.number_of_audio_samples = number_of_audio_samples
        self.min_volume_threshold = float(min_volume_threshold)
        self.n_rolling_history = n_rolling_history

        if(debug):
            Audio.tryPort(name)
        if(verbose):
            self.print()

    def print(self):
        print("--")
        print("----------------")
        print("Audio Port Config : ")
        print("----------------")
        print("name -> ", self.name)
        print("min_frequency -> ", self.min_frequency)
        print("max_frequency -> ", self.max_frequency)
        print("sampling_rate -> ", self.sampling_rate)
        print("number_of_audio_samples -> ", self.number_of_audio_samples)
        print("min_volume_threshold -> ", self.min_volume_threshold)
        print("n_rolling_history -> ", self.n_rolling_history)
        print("----------------")
        print("--")
