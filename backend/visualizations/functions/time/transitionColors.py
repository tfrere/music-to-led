import numpy as np

class TransitionColors():

    def initTransitionColorShapes(self):
        self.color_index = 0

    @staticmethod
    def lerp2(a, b, t):
        return [
            a[0]*(1 - t) + b[0]*t,
            a[1]*(1 - t) + b[1]*t,
            a[2]*(1 - t) + b[2]*t
        ]

    @staticmethod
    def getColorIndexes(index, len):
        return [index % len, (index + 1) % len]

    @staticmethod
    def rgbLerp(a, b, time):
        return [a[0] + (b[0] - a[0]) * time,
        a[1] + (b[1] - a[1]) * time,
        a[2] + (b[2] - a[2]) * time]

    def visualizeTransitionColorShapes(self):
        """Effect that alternate two colors moving forward"""

        ms = self.timeSinceStart.getMs()
        interval = self.timeSinceStart.getMsIntervalFromBpm(self.active_state.time_interval)
        color_scheme = self.active_state.formatted_color_schemes[self.active_state.active_color_scheme_index]
        currentTime = round(ms / interval, 2)

        if(ms > interval):
            self.color_index += 1
            self.timeSinceStart.restart()
            currentTime = 0

        if(self.color_index == len(color_scheme)):
            self.color_index = 0

        color_indexes = self.getColorIndexes(self.color_index, len(color_scheme))


        # print("current time " + str(currentTime))
        # if(currentTime == 1.0):
        #     print("tic")
        #     print(str(color_scheme))
        #     print("color " + str(self.pixels[0][0]) + ", " + str(self.pixels[1][0]) + ", " + str(self.pixels[2][0]))
        #     print(color_indexes[0], color_indexes[1])
        #     print(str(color_scheme[color_indexes[0]]) + " " + str(color_scheme[color_indexes[1]]))


        color = self.lerp2(color_scheme[color_indexes[0]], color_scheme[color_indexes[1]], currentTime)
        self.pixels[0] = color[0]
        self.pixels[1] = color[1]
        self.pixels[2] = color[2]


        return self.pixelReshaper.reshapeFromPixels(self.pixels)
