def saveToYmlFile(self):
    print(self.file_name)
    with open(self.file_name, "w") as fileDescriptor:
        obj_to_save = deepcopy(self)
        obj_to_save.strips = deepcopy(obj_to_save._strips)
        for strip in obj_to_save.strips:
            for sub in dir(strip):
                if sub.startswith("_") and not sub.startswith("__"):
                    del strip.__dict__[sub]
            for state in strip.states:
                for sub in dir(state):
                    if sub.startswith("_") and not sub.startswith("__"):
                        del state.__dict__[sub]
        for item in dir(obj_to_save):
            if item.startswith("_") and not item.startswith("__"):
                del obj_to_save.__dict__[item]

        return yaml.dump(obj_to_save, fileDescriptor, sort_keys=False)
