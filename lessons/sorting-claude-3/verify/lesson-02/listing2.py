def check_strict_weak(values, before):
    """Brute-force check of the strict-weak-ordering axioms on a sample."""
    for x in values:
        if before(x, x):
            return ("not irreflexive", x)
    for x in values:
        for y in values:
            for z in values:
                if before(x, y) and before(y, z) and not before(x, z):
                    return ("not transitive", x, y, z)

    def tie(x, y):
        return not before(x, y) and not before(y, x)

    for x in values:
        for y in values:
            for z in values:
                if tie(x, y) and tie(y, z) and not tie(x, z):
                    return ("ties not transitive", x, y, z)
    return None
