import numpy as np
from scipy.ndimage.filters import gaussian_filter1d
from helpers.audio.expFilter import ExpFilter


def memoize(function):
    """Provides a decorator for memoizing functions"""
    from functools import wraps
    memo = {}

    @wraps(function)
    def wrapper(*args):
        if args in memo:
            return memo[args]
        else:
            rv = function(*args)
            memo[args] = rv
            return rv
    return wrapper


@memoize
def normalizedLinspace(size):
    return np.linspace(0, 1, size)


def interpolate(y, new_length):
    """Intelligently resizes the array by linearly interpolating the values
    Parameters
    ----------
    y : np.array
        Array that should be resized
    new_length : int
        The length of the new interpolated array
    Returns
    -------
    z : np.array
        New array with length of new_length that contains the interpolated
        values of y.
    """
    if len(y) == new_length:
        return y
    x_old = normalizedLinspace(len(y))
    x_new = normalizedLinspace(new_length)
    z = np.interp(x_new, x_old, y)
    return z


class Spectrum():

    def initSpectrum(self):

        # if(self.strip_config.is_mirror):
        #     new_length = self._number_of_pixels // 2
        # else:
        new_length = self._number_of_pixels

        self.prev_spectrum = np.tile(0.01, new_length)

        self.r_filt = ExpFilter(
            np.tile(0.01, new_length),
            alpha_decay=0.2,
            alpha_rise=0.99
        )
        self.g_filt = ExpFilter(
            np.tile(0.01, new_length),
            alpha_decay=0.05,
            alpha_rise=0.3
        )
        self.b_filt = ExpFilter(
            np.tile(0.01, new_length),
            alpha_decay=0.1,
            alpha_rise=0.5
        )
        self.common_mode = ExpFilter(
            np.tile(0.01, new_length),
            alpha_decay=0.99,
            alpha_rise=0.01
        )

    def visualizeSpectrum(self):
        """Effect that maps the Mel filterbank frequencies onto the LED strip"""

        active_color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]
        new_length = self._number_of_pixels

        audio_data = np.copy(interpolate(self.audio_data, new_length))

        self.common_mode.update(audio_data)
        diff = audio_data - self.prev_spectrum
        self.prev_spectrum = np.copy(audio_data)

        # Color channel mappings

        r = self.r_filt.update(
            audio_data - self.common_mode.value) * active_color_scheme[0][0] / 100
        g = np.abs(diff) * active_color_scheme[0][1] / 1000
        b = self.b_filt.update(np.copy(audio_data)) * \
            active_color_scheme[0][2] / 100

        # r = self.r_filt.update(
        #     audio_data - self.common_mode.value) * active_color_scheme[0][0]
        # g = self.g_filt.update(
        #     np.copy(audio_data - self.common_mode.value)) * active_color_scheme[0][1]
        # b = self.b_filt.update(
        #     np.copy(audio_data - self.common_mode.value)) * active_color_scheme[0][2]

        self.pixels = np.array([r, g, b]) * 255

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
