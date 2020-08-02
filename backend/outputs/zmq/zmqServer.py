import time
import zmq
import json
import zerorpc
import datetime


class ZmqServer():

    def __init__(self, host, verbose=False):

        self.host = host
        self.topic = "sendInfos"
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.PUB)
        self.socket.bind(host)
        self.verbose = verbose

    def computeConfigData(self, shared_list):

        config = shared_list[0]

        config_json = json.dumps(
            config, default=lambda o: o.__dict__)

        message = json.loads(
            bytes(config_json, encoding="utf-8"))
        string = ("%s %s" % (self.topic, str(message)))
        if(self.verbose):
            print(string)

        return string

    def computeLiveData(self, shared_list):

        # 0     : Config
        # 1     : Audio datas
        # 2...n : [pixels, strip_config, active_state, framerateCalculator.getFps()]
        # 2 + config._number_of_strips + ...n : isOnline for each strip
        audios_json = ""
        pixels_json = ""
        strips_json = ""

        config = shared_list[0]
        audios = []
        pixels = []
        strips = "["
        number_of_strips = shared_list[0]._number_of_strips
        are_strips_online = []
        framerates = []
        active_states = "["

        for i in range(len(shared_list[1])):
            audios.append(shared_list[1][i].tolist())

        for i in range(number_of_strips):
            pixelsFrame = shared_list[2 + i][0]
            strip = shared_list[2 + i][1]
            active_state = shared_list[2 + i][2]
            pixels.append(pixelsFrame.tolist())
            are_strips_online.append(shared_list[2 + number_of_strips + i])
            framerates.append(shared_list[2 + i][3])

            if(i != number_of_strips - 1):
                strips += " " + \
                    json.dumps(
                        strip, default=lambda o: o.__dict__) + ","
                active_states += " " + \
                    json.dumps(
                        active_state, default=lambda o: o.__dict__) + ","
            else:
                strips += " " + \
                    json.dumps(
                        strip, default=lambda o: o.__dict__)
                active_states += " " + \
                    json.dumps(active_state, default=lambda o: o.__dict__)

        config_json = json.dumps(
            config, default=lambda o: o.__dict__)

        audios_json = json.dumps(audios)
        pixels_json = json.dumps(pixels)
        active_states_json = active_states + "]"
        strips_json = strips + "]"
        framerates_json = json.dumps(framerates)
        are_strips_online_json = json.dumps(are_strips_online)

        infos = "{ \"config\": "
        infos += config_json
        infos += ", \"active_states\": "
        infos += str(active_states_json)
        infos += ", \"audios\": "
        infos += str(audios)
        infos += ", \"strips\": "
        infos += str(strips_json)
        infos += ", \"pixels\": "
        infos += str(pixels_json)
        infos += ", \"framerates\": "
        infos += str(framerates_json)
        infos += ", \"are_strips_online\": "
        infos += str(are_strips_online_json)
        infos += ", \"time\": "
        infos += str(datetime.datetime.timestamp(datetime.datetime.now()))
        infos += "}"

        message = json.loads(
            bytes(infos, encoding="utf-8"))
        string = ("%s %s" % (self.topic, str(message)))
        if(self.verbose):
            print(string)

        return string


if __name__ == "__main__":

    server = ZmqServer('tcp://127.0.0.1:8000', verbose=True)

    # server.computeInfos = server.computeTestInfos
    # server.launch()
