class ShapeConfig():

    def __init__(
        self,
        shape=[74, 74, 125, 125]
    ):

        self.shape = shape
        self.number_of_substrip = len(self.shape)
        self.number_of_pixels = 0
        for pixel_number in self.shape:
            self.number_of_pixels += pixel_number

        self.offsets = []
        for i, bock_size in enumerate(self.shape):
            if(i - 1 >= 0):
                self.offsets.append(bock_size + self.offsets[i - 1])
            else:
                self.offsets.append(bock_size)

    def print(self):
        print("--")
        print("----------------")
        print("Shape Config : ")
        print("----------------")
        print("shape -> ", self.shape)
        print("number_of_substrip -> ", self.number_of_substrip)
        print("number_of_pixels -> ", self.number_of_pixels)
        print("shape chunks offset -> ", self.offsets)
        print("----------------")
        print("--")
