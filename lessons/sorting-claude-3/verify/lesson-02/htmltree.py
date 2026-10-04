"""Minimal DOM for the lesson page (stdlib only): elements keep their exact source span,
so blocks can be compared byte for byte and prose can be extracted without a browser."""
import html
import re
from html.parser import HTMLParser

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


class El:
    def __init__(self, tag, attrs, start, parent):
        self.tag, self.attrs, self.start, self.end, self.parent = tag, dict(attrs), start, None, parent
        self.children = []

    @property
    def classes(self):
        return (self.attrs.get("class") or "").split()

    def walk(self):
        yield self
        for c in self.children:
            yield from c.walk()

    def find_all(self, pred):
        return [e for e in self.walk() if pred(e)]

    def ancestors(self):
        p = self.parent
        while p is not None:
            yield p
            p = p.parent


class _P(HTMLParser):
    def __init__(self, src):
        super().__init__(convert_charrefs=False)
        self.src = src
        self.line_off = [0]
        for m in re.finditer("\n", src):
            self.line_off.append(m.end())
        self.root = El("#root", {}, 0, None)
        self.cur = self.root

    def _off(self):
        line, col = self.getpos()
        return self.line_off[line - 1] + col

    def handle_starttag(self, tag, attrs):
        e = El(tag, attrs, self._off(), self.cur)
        self.cur.children.append(e)
        if tag in VOID:
            e.end = self._off() + len(self.get_starttag_text())
        else:
            self.cur = e

    def handle_startendtag(self, tag, attrs):
        e = El(tag, attrs, self._off(), self.cur)
        e.end = self._off() + len(self.get_starttag_text())
        self.cur.children.append(e)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        e = self.cur
        while e is not None and e.tag != tag:
            e = e.parent
        if e is None:
            return
        end = self.src.index(">", self._off()) + 1
        e.end = end
        self.cur = e.parent


def parse(src):
    p = _P(src)
    p.feed(src)
    p.close()
    return p.root


def outer(src, e):
    return src[e.start:e.end]


def inner(src, e):
    o = outer(src, e)
    return o[o.index(">") + 1: o.rindex("<")] if e.tag not in VOID else ""


def text_of(raw_html):
    """Visible text of an HTML fragment: tags stripped, entities decoded, whitespace collapsed,
    typographic quotes made straight. Epistemic tag spans become [[TAG:x]] markers."""
    s = re.sub(r'<span class="tag t-(\w+)">[^<]*</span>', r"[[TAG:\1]]", raw_html)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", s).strip()
