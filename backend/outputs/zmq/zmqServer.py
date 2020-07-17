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

    def computeInfos(self, shared_list):

        # 0     : Config
        # 1     : Audio datas
        # 2...n : [pixels, strip_config, active_state, framerateCalculator.getFps()]
        # 2 + config.number_of_strips + ...n : isOnline for each strip
        try:
            audios_json = ""
            pixels_json = ""

            config = shared_list[0]
            audios = []
            pixels = []
            number_of_strips = shared_list[0].number_of_strips
            are_strips_online = []
            framerates = []
            active_states = "["

            for i in range(len(shared_list[1])):
                audios.append(shared_list[1][i].tolist())

            for i in range(number_of_strips):
                pixelsFrame = shared_list[2 + i][0]
                active_state = shared_list[2 + i][2]
                config.strips[i].midi_logs = shared_list[2 + i][1].midi_logs
                pixels.append(pixelsFrame.tolist())
                are_strips_online.append(shared_list[2 + number_of_strips + i])
                framerates.append(shared_list[2 + i][3])

                if(i != number_of_strips - 1):
                    active_states += " " + \
                        json.dumps(
                            active_state, default=lambda o: o.__dict__) + ","
                else:
                    active_states += " " + \
                        json.dumps(active_state, default=lambda o: o.__dict__)

            config_json = json.dumps(
                config, default=lambda o: o.__dict__)

            audios_json = json.dumps(audios)
            pixels_json = json.dumps(pixels)
            active_states_json = active_states + "]"
            framerates_json = json.dumps(framerates)
            are_strips_online_json = json.dumps(are_strips_online)

            infos = "{ \"config\": "
            infos += config_json
            infos += ", \"active_states\": "
            infos += str(active_states_json)
            infos += ", \"audios\": "
            infos += str(audios)
            infos += ", \"pixels\": "
            infos += str(pixels_json)
            infos += ", \"framerates\": "
            infos += str(framerates_json)
            infos += ", \"are_strips_online\": "
            infos += str(are_strips_online_json)
            infos += ", \"time\": "
            infos += str(datetime.datetime.timestamp(datetime.datetime.now()))
            infos += "}"
        except:
            return "error"

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
