class Box:
    def __init__(self, v):
        self.v = v

    def __lt__(self, other):
        return self.v < other.v

    def __repr__(self):
        return f"Box({self.v})"


print(sorted([Box(3), Box(1), Box(2)]))   # [Box(1), Box(2), Box(3)]
