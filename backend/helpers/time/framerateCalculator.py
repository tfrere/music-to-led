import time

from helpers.audio.expFilter import ExpFilter

class FramerateCalculator:
    def __init__(self, desired_framerate):
        self.desired_framerate = desired_framerate
        self.previous_time = time.time() * 1000.0
        """The previous time that the frames_per_second() function was called"""
        self.fps = ExpFilter(
            val = self.desired_framerate,
            alpha_decay = 0.2,
            alpha_rise = 0.2
        )
        """The low-pass filter used to estimate frames-per-second"""
        self.prev_fps_update = time.time()

    def frames_per_second(self):
        """Return the estimated frames per second

        Returns the current estimate for frames-per-second (FPS).
        FPS is estimated by measured the amount of time that has elapsed since
        this function was previously called. The FPS estimate is low-pass filtered
        to reduce noise.

        This function is intended to be called one time for every iteration of
        the program's main loop.

        Returns
        -------
        fps : float
            Estimated frames-per-second. This value is low-pass filtered
            to reduce noise.
        """
        time_now = time.time() * 1000.0
        dt = time_now - self.previous_time
        self.previous_time = time_now
        if dt == 0.0:
            return self.fps.value
        return self.fps.update(1000.0 / dt)

    def forceFrameDelay(self):
        time.sleep(1 / self.desired_framerate)

    def getFps(self):
        fps = self.frames_per_second()
        if time.time() - 0.5 > self.prev_fps_update:
            self.prev_fps_update = time.time()
            return '{:.0f}'.format(fps)
        else:
            return '{:.0f}'.format(fps)
