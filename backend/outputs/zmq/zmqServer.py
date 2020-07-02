import time
import zmq
import json
import zerorpc


class ZmqServer():

    def __init__(self, host, data, verbose=False):

        self.data = data
        self.host = host
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.REP)
        self.socket.bind(host)

        self.verbose = verbose

    def getInfos(self):

        # 0     : Config
        # 1     : Audio datas
        # 2...n : [pixels, strip_config, active_state, framerateCalculator.getFps()]
        # 2 + config.number_of_strips + ...n : isOnline for each strip

        audios_json = ""
        strips_json = ""
        config_json = self.data[0].getJsonFromConfig()
        audios = []
        strips = []
        number_of_strips = self.data[0].number_of_strips
        are_strips_online = []
        framerates = []
        active_states = "[ "

        for i in range(len(self.data[1])):
            audios.append(self.data[1][i].tolist())

        for i in range(number_of_strips):
            pixels = self.data[2 + i][0]
            active_state = self.data[2 + i][2]
            strips.append(pixels.tolist())
            are_strips_online.append(self.data[2 + number_of_strips + i])
            framerates.append(self.data[2 + i][3])
            if(i != number_of_strips - 1):
                active_states += " " + active_state.getJsonFromState() + ","
            else:
                active_states += " " + active_state.getJsonFromState()

        audios_json = json.dumps(audios)
        strips_json = json.dumps(strips)
        active_states_json = active_states + " ]"
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
        infos += ", \"framerates\": "
        infos += str(framerates_json)
        infos += ", \"are_strips_online\": "
        infos += str(are_strips_online_json)
        infos += "}"

        return infos

    def getTestInfos(self):
        return self.data

    def launch(self):

        while True:
            #  Wait for next request from client
            message = self.socket.recv()
            if(self.verbose):
                print("State: %s" % message)
            try:
                message = json.loads(
                    bytes(self.getInfos(), encoding="utf-8"))
                if(self.verbose):
                    print("State: %s" % message)
                    print(message)
                time.sleep(0.050)
                self.socket.send_json(message)
            except:
                message = "Failed to calculate"


if __name__ == "__main__":

    server = ZmqServer('tcp://127.0.0.1:8000', '{"type":"getInfos"}')

    server.getInfos = server.getTestInfos
    server.launch()

    # Test client
    # zerorpc --client --connect tcp://127.0.0.1:8000 getInfos ok
