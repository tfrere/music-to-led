"""
This module implements a Mel Filter Bank.
In other words it is a filter bank with triangular shaped bands
arnged on the mel frequency scale.
An example ist shown in the following figure:
"""

from numpy import abs, append, arange, insert, linspace, log10, round, zeros

class MelBank:

    def __init__(self, fps, min_frequency, max_frequency, sampling_rate, number_of_samples, min_volume_threshold):
        self.samples = None
        self.mel_y = None
        self.mel_x = None
        self.samples = int(sampling_rate *
                      4 / (2.0 * fps))
        self.mel_y, (_, self.mel_x) = self.compute_melmat(
            num_mel_bands = number_of_samples,
            freq_min = min_frequency,
            freq_max = max_frequency,
            num_fft_bands = self.samples,
            sample_rate = sampling_rate
        )

    @staticmethod
    def hertz_to_mel(freq):
        """Returns mel-frequency from linear frequency input.
        Parameter
        ---------
        freq : scalar or ndarray
            Frequency value or array in Hz.
        Returns
        -------
        mel : scalar or ndarray
            Mel-frequency value or ndarray in Mel
        """
        return 2595.0 * log10(1 + (freq / 700.0))

    @staticmethod
    def mel_to_hertz(mel):
        """Returns frequency from mel-frequency input.
        Parameter
        ---------
        mel : scalar or ndarray
            Mel-frequency value or ndarray in Mel
        Returns
        -------
        freq : scalar or ndarray
            Frequency value or array in Hz.
        """
        return 700.0 * (10**(mel / 2595.0)) - 700.0

    @staticmethod
    def melfrequencies_mel_filterbank(num_bands, freq_min, freq_max, num_fft_bands):
        """Returns centerfrequencies and band edges for a mel filter bank
        Parameters
        ----------
        num_bands : int
            Number of mel bands.
        freq_min : scalar
            Minimum frequency for the first band.
        freq_max : scalar
            Maximum frequency for the last band.
        num_fft_bands : int
            Number of fft bands.
        Returns
        -------
        center_frequencies_mel : ndarray
        lower_edges_mel : ndarray
        upper_edges_mel : ndarray
        """

        mel_max = MelBank.hertz_to_mel(freq_max)
        mel_min = MelBank.hertz_to_mel(freq_min)
        delta_mel = abs(mel_max - mel_min) / (num_bands + 1.0)
        frequencies_mel = mel_min + delta_mel * arange(0, num_bands + 2)
        lower_edges_mel = frequencies_mel[:-2]
        upper_edges_mel = frequencies_mel[2:]
        center_frequencies_mel = frequencies_mel[1:-1]
        return center_frequencies_mel, lower_edges_mel, upper_edges_mel

    @staticmethod
    def compute_melmat(
        num_mel_bands = 12,
        freq_min = 64,
        freq_max = 8000,
        num_fft_bands = 513,
        sample_rate = 16000
    ):
        """Returns tranformation matrix for mel spectrum.
        Parameters
        ----------
        num_mel_bands : int
            Number of mel bands. Number of rows in melmat.
            Default: 24
        freq_min : scalar
            Minimum frequency for the first band.
            Default: 64
        freq_max : scalar
            Maximum frequency for the last band.
            Default: 8000
        num_fft_bands : int
            Number of fft-frequenc bands. This ist NFFT/2+1 !
            number of columns in melmat.
            Default: 513   (this means NFFT=1024)
        sample_rate : scalar
            Sample rate for the signals that will be used.
            Default: 44100
        Returns
        -------
        melmat : ndarray
            Transformation matrix for the mel spectrum.
            Use this with fft spectra of num_fft_bands_bands length
            and multiply the spectrum with the melmat
            this will tranform your fft-spectrum
            to a mel-spectrum.
        frequencies : tuple (ndarray <num_mel_bands>, ndarray <num_fft_bands>)
            Center frequencies of the mel bands, center frequencies of fft spectrum.
        """
        center_frequencies_mel, lower_edges_mel, upper_edges_mel =  \
            MelBank.melfrequencies_mel_filterbank(
                num_mel_bands,
                freq_min,
                freq_max,
                num_fft_bands
            )

        center_frequencies_hz = MelBank.mel_to_hertz(center_frequencies_mel)
        lower_edges_hz = MelBank.mel_to_hertz(lower_edges_mel)
        upper_edges_hz = MelBank.mel_to_hertz(upper_edges_mel)
        freqs = linspace(0.0, sample_rate / 2.0, num_fft_bands)
        melmat = zeros((num_mel_bands, num_fft_bands))

        for imelband, (center, lower, upper) in enumerate(zip(
                center_frequencies_hz, lower_edges_hz, upper_edges_hz)):

            left_slope = (freqs >= lower) == (freqs <= center)
            melmat[imelband, left_slope] = (
                (freqs[left_slope] - lower) / (center - lower)
            )

            right_slope = (freqs >= center) == (freqs <= upper)
            melmat[imelband, right_slope] = (
                (upper - freqs[right_slope]) / (upper - center)
            )

        return melmat, (center_frequencies_mel, freqs)
