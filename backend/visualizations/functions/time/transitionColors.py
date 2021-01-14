import numpy as np


class TransitionColors():

    def initTransitionColorShapes(self):
        self.color_index = 0

    def visualizeTransitionColorShapes(self):
        """Effect that alternate two colors moving forward"""

        ms = self._timeSinceStart.getMs()
        interval = self._timeSinceStart.getMsIntervalFromBpm(
            self.active_state.time_interval)
        color_scheme = self.config._formatted_color_schemes[
            self.active_state.active_color_scheme_index]
        print(ms, interval)
        currentTime = round(ms / interval, 2)
        # print(-2)

        if(ms > interval):
            self.color_index += 1
            self._timeSinceStart.restart()
            currentTime = 0
        # print(-1)

        if(self.color_index == len(color_scheme)):
            self.color_index = 0
        # print(0)

        color_indexes = self.getColorIndexes(
            self.color_index, len(color_scheme))
        # print(1)

        # print("current time " + str(currentTime))
        # if(currentTime == 1.0):
        #     print("tic")
        #     print(str(color_scheme))
        #     print("color " + str(self.pixels[0][0]) + ", " + str(self.pixels[1][0]) + ", " + str(self.pixels[2][0]))
        #     print(color_indexes[0], color_indexes[1])
        #     print(str(color_scheme[color_indexes[0]]) + " " + str(color_scheme[color_indexes[1]]))

        color = self.rgbLerp(
            color_scheme[color_indexes[0]], color_scheme[color_indexes[1]], currentTime)
        self.pixels[0] = color[0]
        self.pixels[1] = color[1]
        self.pixels[2] = color[2]
        print(2)

        return self.pixelReshaper.reshapeFromPixels(self.pixels)
