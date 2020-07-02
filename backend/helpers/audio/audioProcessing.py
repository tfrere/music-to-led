import time
import numpy as np
from scipy.ndimage.filters import gaussian_filter1d

from helpers.audio.expFilter import ExpFilter
from helpers.audio.melbank import MelBank


class AudioProcessing():
    def __init__(
        self,
        min_frequency=200,
        max_frequency=12000,
        sampling_rate=44100,
        number_of_audio_samples=24,
        min_volume_threshold=1e-7,
        n_rolling_history=4,
        framerate=60
    ):

        self.samples_per_frame = int(sampling_rate / framerate)
        self.y_roll = np.random.rand(
            n_rolling_history, self.samples_per_frame) / 1e16
        self.min_volume_threshold = min_volume_threshold
        self.number_of_audio_samples = number_of_audio_samples
        self.melBank = MelBank(framerate, min_frequency, max_frequency,
                               sampling_rate, number_of_audio_samples, min_volume_threshold)

        self.fft_plot_filter = ExpFilter(
            np.tile(1e-1, number_of_audio_samples),
            alpha_decay=0.5,
            alpha_rise=0.99
        )

        self.mel_gain = ExpFilter(
            np.tile(1e-1, number_of_audio_samples),
            alpha_decay=0.01,
            alpha_rise=0.99
        )

        self.mel_smoothing = ExpFilter(
            np.tile(1e-1, number_of_audio_samples),
            alpha_decay=0.5,
            alpha_rise=0.99
        )

        self.fft_window = np.hamming(
            self.samples_per_frame * n_rolling_history
        )
    def rfft(self, data, window=None):
        """Real-Valued Fast Fourier Transform"""
        window = 1.0 if window is None else window(len(data))
        ys = np.abs(np.fft.rfft(data * window))
        xs = np.fft.rfftfreq(len(data), 1.0 / self.sampling_rate)
        return xs, ys
    def fft(self, data, window=None):
        """Fast Fourier Transform"""
        window = 1.0 if window is None else window(len(data))
        ys = np.fft.fft(data * window)
        xs = np.fft.fftfreq(len(data), 1.0 / self.sampling_rate)
        return xs, ys

    def render(self, audio_samples):
        # Sound case
        # Normalize samples between 0 and 1
        y = audio_samples / 2.0**15
        # Construct a rolling window of audio samples
        self.y_roll[:-1] = self.y_roll[1:]
        self.y_roll[-1, :] = np.copy(y)
        y_data = np.concatenate(self.y_roll, axis=0).astype(np.float32)
        vol = np.max(np.abs(y_data))

        if vol < self.min_volume_threshold:
            # print('No audio input. Volume below threshold. Volume:', vol)
            return np.tile(0., self.number_of_audio_samples)
        else:
            # Transform audio input into the frequency domain
            N = len(y_data)
            N_zeros = 2**int(np.ceil(np.log2(N))) - N
            # Pad with zeros until the next power of two
            y_data *= self.fft_window
            y_padded = np.pad(y_data, (0, N_zeros), mode='constant')
            YS = np.abs(np.fft.rfft(y_padded)[:N // 2])
            # Construct a Mel filterbank from the FFT data
            mel = np.atleast_2d(YS).T * self.melBank.mel_y.T
            # Scale data to values more suitable for visualization
            mel = np.sum(mel, axis=0)
            mel = mel**2.0
            # Gain normalization
            self.mel_gain.update(np.max(gaussian_filter1d(mel, sigma=1.0)))
            mel /= self.mel_gain.value
            mel = self.mel_smoothing.update(mel)
            return mel
