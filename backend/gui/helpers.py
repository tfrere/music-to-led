import os, psutil, math

def clearTerminal():
    os.system('cls' if os.name == 'nt' else 'clear')

def rgbToAnsi256(r, g, b):
    if (r == g and g == b):
        if (r < 8):
            return 16
        if (r > 248):
            return 231
        return round(((r - 8) / 247) * 24) + 232
    ansi = 16 + (36 * round(r / 255 * 5)) + (6 * round(g / 255 * 5)) + round(b / 255 * 5)
    return ansi

def getCpuInPercent():
    return psutil.cpu_percent()

def getVirtualMemoryConsumtion():
    """
    #   {
    #     "total": 8589934592,
    #     "available": 2707013632,
    #     "percent": 68.5,
    #     "used": 4336054272,
    #     "free": 39534592,
    #     "active": 2670501888,
    #     "inactive": 2652979200,
    #     "wired": 1665552384
    # }
     """
    return dict(psutil.virtual_memory()._asdict())
