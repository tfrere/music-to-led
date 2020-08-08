# https://theasciicode.com.ar/extended-ascii-code/block-graphic-character-ascii-code-219.html

import signal
import time
import sys
import psutil
import os
from blessed import Terminal
from functools import partial
import numpy as np

import time

from gui.helpers import *


class KeyboardInput():
    def __init__():
        print("toto")

# class Debounce(object):
#     """ This is a proper debounce function, the way a electrical engineer would think about it.
#     This wrapper never calls sleep.  It has two counters: one for successful calls, and one for rejected calls.
#     If the wrapped function throws an exception, the counters and debounce timer are still correct """
#
#     def __init__(self, period):
#         self.period = period  # never call the wrapped function more often than this (in seconds)
#         self.count = 0  # how many times have we successfully called the function
#         self.count_rejected = 0  # how many times have we rejected the call
#         self.last = None  # the last time it was called
#         self.old_active_state = 0
#
#     # force a reset of the timer, aka the next call will always work
#     def reset(self):
#         self.last = None
#
#     def __call__(self, f):
#         def wrapped(*args, **kwargs):
#             now = time.time()
#             willcall = False
#             if self.last is not None:
#                 # amount of time since last call
#                 delta = now - self.last
#                 if delta >= self.period:
#                     willcall = True
#                 else:
#                     willcall = False
#             else:
#                 willcall = True  # function has never been called before
#
#             if willcall:
#                 # set these first incase we throw an exception
#                 self.last = now  # don't use time.time()
#                 self.count += 1
#                 f(*args, **kwargs)  # call wrapped function
#             else:
#                 self.count_rejected += 1
#         return wrapped


class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class ShellInterface():
    def __init__(self, config):

        self.input = ""

        self.original_min_width = 150
        self.min_width = self.original_min_width
        self.header_offset = 0
        self.audio_offset = 7
        self.strip_offset = 12
        # 0,41,51 bg
        # 131,143,136 bprder
        # 121,110,103 inner border
        # 20,147,121 online

        self.pixel_char = "◼"  # █
        self.audio_viz_chars = "▁▂▃▅▆▇"
        self.box_chars = "─|┌┐└┘"  # ││

        self.rgb_border_color = (100, 100, 100)
        self.rgb_inner_border_color = (70, 70, 70)
        self.rgb_success_color = (0, 255, 0)
        self.rgb_danger_color = (255, 0, 0)
        # self.debounce = Debounce(1.0)
        self.has_to_draw_static_components = True
        self.frameIndex = 0

        self.config = config

        time.sleep(1)

        self.term = Terminal()
        self.echo = partial(print, end='', flush=True)

        self.echo(self.term.clear)

        self.height = self.term.height
        self.width = self.term.width
        self.color_background = self.term.on_black

        signal.signal(signal.SIGWINCH, self.updateShellDimensionsHandler)
        signal.siginterrupt(signal.SIGWINCH, False)

        self.term.fullscreen()

        self.updateShellDimensions()

    def updateShellDimensionsHandler(self, signum, frame):
        self.updateShellDimensions()

    def clearTerminal(self):
        print(self.term.clear())

    def updateShellDimensions(self):
        self.height = self.term.height
        self.width = self.term.width
        if(self.width > self.original_min_width):
            self.min_width = self.width

        self.term.location(0, 0)
        self.updateIsBellowMinWidth()
        clearTerminal()
        self.has_to_draw_static_components = True

    def updateIsBellowMinWidth(self):
        if (self.width < self.original_min_width):
            self.is_below_min_width = True
        else:
            self.is_below_min_width = False

    def getConsumedVirtualMemory(self):
        import json
        memoryConsumtion = json.dumps(
            getVirtualMemoryConsumtion()["percent"], indent=4)
        return memoryConsumtion

    def absolutePrint(self, x, y, str, rgbBgColor=(255, 0, 0),):
        self.echo(self.term.on_gray4(self.term.move(x, y) + str))

    def textWithColor(self, r, g, b, text):
        return self.term.color(int(rgbToAnsi256(r, g, b)))(text)

    def printHeader(self, y):

        # self.drawBox((0,0), (60,6), self.rgb_border_color)
        # self.print(self.term.move(y + 2, 0) + self.textWithColor(self.rgb_inner_border_color[0],self.rgb_inner_border_color[1], self.rgb_inner_border_color[2], "├" + ("─" * (60 - 2)) + "┤"))

        space = 2
        self.absolutePrint(y + 1, space, "Music To Led v0.1.1")

        # add STATES nb
        self.absolutePrint(y + 2, space, "Strips: " + str(len(self.config._strips)) + " | audio source: " +
                           str(self.config._number_of_audio_ports))
        self.absolutePrint(y + 4, space, "Shell dimensions: " +
                           str(self.width) + "x" + str(self.height))
        self.absolutePrint(y + 5, space, "Memory consumed: " +
                           str(self.getConsumedVirtualMemory()) + " Key input: " + self.input)

    def drawBackground(self):
        if(self.has_to_draw_static_components):
            for i in range(self.height):
                line = " " * self.width
                self.absolutePrint(i, 0, line)

    def drawBox(self, offset, size, color=(255, 255, 255)):
        x, y = offset
        w, h = size
        r, g, b = color

        first_line = self.box_chars[2] + \
            (self.box_chars[0] * (w - 2)) + self.box_chars[3]
        middle_line = self.box_chars[1] + (" " * (w - 2)) + self.box_chars[1]
        last_line = self.box_chars[4] + \
            (self.box_chars[0] * (w - 2)) + self.box_chars[5]

        self.absolutePrint(y, x, self.textWithColor(r, g, b, first_line))
        for i in range(h):
            self.absolutePrint(
                y + i + 1, x, self.textWithColor(r, g, b, middle_line))
        self.absolutePrint(y + h, x, self.textWithColor(r, g, b, last_line))

    def waitForInput(self):
        self.input += self.term.inkey(timeout=0)

    def printAudio(self, y, x, name, audio_datas):

        if(self.has_to_draw_static_components):
            offset = (x - 1, self.audio_offset)
            size = (29, 4)
            self.drawBox(offset, size, self.rgb_border_color)
            self.absolutePrint(y + 2, x - 1, self.textWithColor(
                self.rgb_inner_border_color[0], self.rgb_inner_border_color[1], self.rgb_inner_border_color[2], "├" + ("─" * (29 - 2)) + "┤"))

        self.absolutePrint(y + 1, x + 1, name)

        graph = ""

        for channel in audio_datas:
            charIndex = int(channel * 10) if int(channel * 10) < len(
                self.audio_viz_chars) - 1 else len(self.audio_viz_chars) - 1
            graph += self.audio_viz_chars[charIndex]

        self.absolutePrint(y + 3, x + 1, graph)
        # self.absolutePrint(0, 0, "")

    def printStrip(self, y, is_connected, framerate, strip_config, active_state, pixels):

        if(self.has_to_draw_static_components):
            total_number_of_lines = self.getTotalLinesOfStrip(strip_config)
            offset = (0, y)
            size = (self.min_width, 8 + total_number_of_lines)
            self.drawBox(offset, size, self.rgb_border_color)
            self.absolutePrint(offset[1] + 2, 0, self.textWithColor(self.rgb_inner_border_color[0],
                                                                    self.rgb_inner_border_color[1], self.rgb_inner_border_color[2], "├" + ("─" * (self.min_width - 2)) + "┤"))
            self.absolutePrint(offset[1] + 7, 0, self.textWithColor(self.rgb_inner_border_color[0],
                                                                    self.rgb_inner_border_color[1], self.rgb_inner_border_color[2], "├" + ("─" * (self.min_width - 2)) + "┤"))

        is_connected = self.textWithColor(
            0, 255, 0, ' online ⬤ ') if is_connected else self.textWithColor(255, 0, 0, 'offline ⬤ ')
        is_connected_str = str(framerate) + self.textWithColor(100, 100, 100,
                                                               ' FPS ') + self.textWithColor(100, 100, 100, ' | ') + is_connected
        mirror_mode = self.textWithColor(
            255, 255, 255, 'mirror') if active_state.is_mirror else self.textWithColor(50, 50, 50, 'mirror')
        reverse_mode = self.textWithColor(
            255, 255, 255, 'reverse') if active_state.is_reverse else self.textWithColor(50, 50, 50, 'reverse')
        color_scheme = ""
        for current_color in self.config._formatted_color_schemes[active_state.active_color_scheme_index]:
            color_scheme += self.term.color(
                int(rgbToAnsi256(current_color[0], current_color[1], current_color[2])))('█ ')
        shape = ""
        for current_shape in strip_config._shapes[active_state.division_value].shape:
            shape += "[" + str(current_shape) + "]"

        self.absolutePrint(y + 1, 2, strip_config.name
                           + self.textWithColor(100, 100, 100, ' on port ')
                           + "                                                                                  ")
        self.absolutePrint(y + 1, 2, strip_config.name
                           + self.textWithColor(100, 100, 100, ' on port ')
                           + strip_config.serial_port_name)

        self.absolutePrint(y + 1, self.min_width - 22, is_connected_str)

        self.absolutePrint(
            y + 3, 2, "                                                                                  ")

        self.absolutePrint(y + 3, 2, self.textWithColor(100, 100, 100, 'state ')
                           + active_state.name
                           + self.textWithColor(100, 100,
                                                100, ' with visualizer ')
                           + active_state.active_visualizer_effect)

        if(strip_config._midi_logs and strip_config._midi_logs[0]["port"] and strip_config._midi_logs[0]["note"]):
            midi_note_to_print = str(strip_config._midi_logs[0]["port"]) + self.textWithColor(
                100, 100, 100, " note played : ") + str(strip_config._midi_logs[0]["note"])
            len_midi_note_to_print = len(str(
                strip_config._midi_logs[0]["port"]) + " note played : " + str(strip_config._midi_logs[0]["note"]))
            self.absolutePrint(y + 3, self.width - len_midi_note_to_print - 2,
                               "                                             ")
            self.absolutePrint(y + 3, self.width -
                               len_midi_note_to_print - 2, midi_note_to_print)

        self.absolutePrint(y + 4, 0, self.textWithColor(
            self.rgb_inner_border_color[0], self.rgb_inner_border_color[1], self.rgb_inner_border_color[2], "├" + ("─" * (self.min_width - 2)) + "┤"))

        self.absolutePrint(
            y + 5, 2, self.textWithColor(100, 100, 100, 'audio channel'))
        self.absolutePrint(y + 6, 2, "                    ")
        self.absolutePrint(
            y + 6, 2, self.config._audio_ports[active_state.active_audio_channel_index].name)

        self.absolutePrint(
            y + 5, 24, self.textWithColor(100, 100, 100, 'color scheme'))
        self.absolutePrint(y + 6, 24, "                    ")
        self.absolutePrint(y + 6, 24, color_scheme)

        self.absolutePrint(
            y + 5, 42, self.textWithColor(100, 100, 100, 'shape'))
        self.absolutePrint(y + 6, 42, "                           ")
        self.absolutePrint(y + 6, 42, shape)

        self.absolutePrint(
            y + 5, 69, self.textWithColor(100, 100, 100, 'time_interval'))
        self.absolutePrint(y + 6, 69, "                    ")
        self.absolutePrint(y + 6, 69, str(active_state.time_interval))

        self.absolutePrint(
            y + 5, 85, self.textWithColor(100, 100, 100, 'brightness'))
        self.absolutePrint(y + 6, 85, "                    ")
        self.absolutePrint(y + 6, 85, str(active_state.max_brightness))

        self.absolutePrint(
            y + 5, 97, self.textWithColor(100, 100, 100, 'chunk_size'))
        self.absolutePrint(y + 6, 97, "                    ")
        self.absolutePrint(y + 6, 97, str(active_state.chunk_size))

        self.absolutePrint(
            y + 5, 112, self.textWithColor(100, 100, 100, 'blur_value'))
        self.absolutePrint(y + 6, 112, "                    ")
        self.absolutePrint(y + 6, 112, str(active_state.blur_value))

        self.absolutePrint(y + 5, 130, mirror_mode)
        self.absolutePrint(y + 5, 140, reverse_mode)

        total_number_of_lines = self.printPixels(
            y + 8, 2, strip_config, pixels)

        return total_number_of_lines

    def printChunk(self, y, x, strip_config, pixels, chunk_index):

        total_number_of_lines = 0
        j = 0
        array = ""

        chunk_length = strip_config._physical_shape.shape[chunk_index]
        if(chunk_index == 0):
            chunk_offset = 0
        else:
            chunk_offset = strip_config._physical_shape._offsets[chunk_index - 1]

        for i in range(chunk_offset, chunk_offset + chunk_length):
            if(i >= chunk_offset + chunk_length - 1):
                array = array[:len(array)] + "|"

                self.absolutePrint(y + total_number_of_lines, x, array)
                if(i != strip_config._physical_shape._number_of_pixels):
                    total_number_of_lines += 1
                return total_number_of_lines
            elif(j >= self.min_width - 4):
                self.absolutePrint(y + total_number_of_lines, x, array)
                array = ""
                total_number_of_lines += 1
                j = 0
            else:
                if(j == 0 and total_number_of_lines == 0):
                    array += "|"
                else:
                    if(i < len(pixels[0])):
                        # array += self.term.color(int(rgbToAnsi256(pixels[0][i], pixels[1][i], pixels[2][i])))(self.pixel_char)
                        array += self.textWithColor(
                            pixels[0][i], pixels[1][i], pixels[2][i], self.pixel_char)
                    else:
                        array += self.term.color(
                            int(rgbToAnsi256(50, 50, 50)))('-')
                j += 1

        return total_number_of_lines

    def getTotalLinesOfStrip(self, strip_config):

        total_number_of_lines = 0

        for k, chunk in enumerate(strip_config._physical_shape.shape):

            j = 0
            chunk_length = strip_config._physical_shape.shape[k]
            if(k == 0):
                chunk_offset = 0
            else:
                chunk_offset = strip_config._physical_shape._offsets[k - 1]

            for i in range(chunk_offset, chunk_offset + chunk_length):
                if(i >= chunk_offset + chunk_length - 1):
                    if(i != strip_config._physical_shape._number_of_pixels):
                        total_number_of_lines += 1
                    break
                elif(j >= self.min_width - 4):
                    total_number_of_lines += 1
                    j = 0
                else:
                    j += 1

        return total_number_of_lines

    def printPixels(self, y, x, strip_config, pixels):

        total_number_of_lines = 0
        for i, chunk in enumerate(strip_config._physical_shape.shape):
            total_number_of_lines += self.printChunk(
                y + total_number_of_lines, 2, strip_config, pixels, i)

        return total_number_of_lines

    def drawFrame(self, shared_list):

        config = shared_list[0]
        audio_datas = shared_list[1]
        pixels = [[], [], []]
        total_number_of_lines = 0

        self.frameIndex += 1

        with self.term.hidden_cursor(), self.term.cbreak():

            self.drawBackground()

            if(self.is_below_min_width):
                minWidthSentence = "<-- Please enlarge your shell until you reach " + \
                    str(self.width) + " / " + \
                    str(self.original_min_width) + " char width -->"
                self.absolutePrint(self.height // 2, self.width //
                                   2 - (len(minWidthSentence) // 2), minWidthSentence)
            else:

                for index in range(config._number_of_audio_ports):
                    self.printAudio(
                        self.audio_offset,
                        (32 * index) + 1,
                        config._audio_ports[index].name,
                        audio_datas[index]
                    )

                total_number_of_lines = 0
                for index in range(config._number_of_strips):
                    pixels = shared_list[2 + index][0]
                    strip_config = shared_list[2 + index][1]
                    active_state = shared_list[2 + index][2]
                    fps = shared_list[2 + index][3]
                    is_online = shared_list[2 +
                                            config._number_of_strips + index]

                    total_number_of_lines += self.printStrip(
                        self.strip_offset +
                        (index * 9 + total_number_of_lines),
                        is_online,
                        fps,
                        strip_config,
                        active_state,
                        pixels
                    )

                self.printHeader(self.header_offset)

                if(self.has_to_draw_static_components):
                    self.has_to_draw_static_components = False

                # self.absolutePrint(0, 0, self.textWithColor(0, 0, 0, '█'))
                self.waitForInput()
