from copy import deepcopy


class TestClass1:
    def __init__(self):
        self.class1string = "toto"
        self._class1privateString = "toto"


class TestClass2:
    def __init__(self):
        self.class2string = "toto"
        self._class2privateString = "toto"


class TestClass3:
    def __init__(self):
        self.class3string = "toto"
        self._class3privateString = "toto"
        self.class3class = TestClass2()
        self._class3privateClass = TestClass1()


class TestClass3:
    def __init__(self):
        self.class3string = "toto"
        self._class3privateString = "toto"
        self.class3class = TestClass2()
        self._class3privateClass = TestClass1()
        self.bigClass3listClass = [
            TestClassList1(), TestClassList1(), TestClassList1()]
        self._bigClass3listPrivateClass = [
            TestClass2(), TestClass2(), TestClass2()]


class TestClassList1:
    def __init__(self):
        self.class3string = "toto"
        self._class3privateString = "toto"
        self.class3class = TestClass2()
        self._class3privateClass = TestClass1()


class BigClass:
    def __init__(self):
        self.bigClassString = "toto"
        self._bigClassPrivateString = "toto"
        self.bigClassArray = ["toto", "toto"]
        self._bigClassPrivateArray = ["toto", "toto"]
        self.bigClass3class = TestClass3()
        self.bigClass3listClass = [
            TestClassList1(), TestClassList1(), TestClassList1()]
        self._bigClass3listPrivateClass = [
            TestClass2(), TestClass2(), TestClass2()]


testClassInstance1 = TestClass2()
testClassInstance2 = TestClass3()

listOfAcceptedClass = (TestClass1, TestClass2, TestClass3)

testBigClassInstance = BigClass()

rejectedLists = [
    "append",
    "clear",
    "copy",
    "count",
    "extend",
    "index",
    "insert",
    "pop",
    "remove",
    "reverse",
    "sort",
]


def recursivePurge(target, index=0):
    for item in dir(target):
        if not item.startswith("__"):
            if item.startswith("_"):
                del target.__dict__[item]
                continue
            if(isinstance(getattr(target, item), list) and not any(item in s for s in rejectedLists) and "__main__" in str(getattr(target, item)[0])):
                for subitem in getattr(target, item):
                    recursivePurge(subitem, index + 1)
            if(isinstance(getattr(target, item), listOfAcceptedClass)):
                recursivePurge(getattr(target, item), index + 1)
    return target


def recursivePrint(target, index=0):
    for item in dir(target):
        if not item.startswith("__"):
            if(isinstance(getattr(target, item), list) and not any(item in s for s in rejectedLists) and "__main__" in str(getattr(target, item)[0])):
                for subitem in getattr(target, item):
                    print(index, item)
                    # recursivePrint(subitem, index + 1)
            else:
                print(index, item)
            if(isinstance(getattr(target, item), listOfAcceptedClass)):
                recursivePrint(getattr(target, item), index + 1)


res = recursivePurge(testBigClassInstance)
recursivePrint(res)
