from helpers.color.colorSchemeFormatter import ColorSchemeFormatter


class StateConfig():

    def __init__(
        self,
        name="statename",
        max_brightness=255,
        active_visualizer_effect="clear_frame",
        division_value=0,
        active_audio_channel_index=0,
        audio_samples_filter_min=0,
        audio_samples_filter_max=24,
        audio_gain=1,
        audio_decay=0.1,
        is_reverse=False,
        time_interval=120,
        chunk_size=5,
        blur_value=0.1,
        is_mirror=False,
        active_color_scheme_index=0,
        debug=False,
        verbose=False
    ):
        self.name = name

        self.active_visualizer_effect = active_visualizer_effect

        self.active_color_scheme_index = active_color_scheme_index

        self.active_audio_channel_index = active_audio_channel_index
        self.audio_samples_filter_min = audio_samples_filter_min
        self.audio_samples_filter_max = audio_samples_filter_max
        self.audio_gain = audio_gain
        self.audio_decay = audio_decay

        self.division_value = division_value
        self.max_brightness = max_brightness

        self.time_interval = time_interval
        self.chunk_size = chunk_size
        self.blur_value = blur_value

        self.is_reverse = is_reverse
        self.is_mirror = is_mirror

        if(verbose):
            self.print()

    def copy(self):
        return StateConfig(
            self.name,
            self.max_brightness,
            self.active_visualizer_effect,
            self.division_value,
            self.active_audio_channel_index,
            self.audio_samples_filter_min,
            self.audio_samples_filter_max,
            self.audio_gain,
            self.audio_decay,
            self.is_reverse,
            self.time_interval,
            self.chunk_size,
            self.blur_value,
            self.is_mirror,
            self.active_color_scheme_index
        )

    def print(self):
        print("--")
        print("----------------")
        print("State Config : ")
        print("----------------")
        print("active_audio_channel_index -> ",
              self.active_audio_channel_index)
        print("audio_samples_filter_min -> ", self.audio_samples_filter_min)
        print("audio_samples_filter_max -> ", self.audio_samples_filter_max)
        print("audio_gain -> ", self.audio_gain)
        print("audio_decay -> ", self.audio_decay)
        print("max_brightness -> ", self.max_brightness)
        print("division_value -> ", self.division_value)
        print("active_visualizer_effect -> ", self.active_visualizer_effect)
        print("time_interval -> ", self.time_interval)
        print("chunk_size -> ", self.chunk_size)
        print("blur_value -> ", self.blur_value)
        print("is_reverse -> ", self.is_reverse)
        print("is_mirror -> ", self.is_mirror)
        print("active_color_scheme_index -> ", self.active_color_scheme_index)
        print("----------------")
        print("--")
