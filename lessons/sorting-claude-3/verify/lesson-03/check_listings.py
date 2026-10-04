"""Extract every Python listing from lesson-03.html, check the copies in this folder match it
exactly, run each one, and check every printed line against its trailing '# ...' comment.
Usage: python3 check_listings.py"""
import html, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, '..', '..', 'lesson-03.html')
src = open(PAGE, encoding='utf8').read()

listings = re.findall(r'<figure class="listing" id="(lst-\d+)">.*?<pre class="py">(.*?)</pre>', src, re.S)
assert [l[0] for l in listings] == ['lst-1', 'lst-2'], [l[0] for l in listings]
files = {'lst-1': 'listing1.py', 'lst-2': 'listing2.py'}
for lid, code in listings:
    code = html.unescape(code)
    path = os.path.join(HERE, files[lid])
    disk = open(path, encoding='utf8').read().rstrip('\n')
    assert disk == code, f'{files[lid]} differs from the page listing {lid}'
    out = subprocess.run([sys.executable, path], capture_output=True, text=True, cwd=HERE, check=True).stdout
    printed = out.rstrip('\n').split('\n')
    expected = [m.group(1).strip() for m in re.finditer(r'^print\(.*\)\s*#\s*(.*)$', code, re.M)]
    assert printed == expected, (lid, printed, expected)
    print(lid, 'matches page; output', printed)

# the find-the-bug snippet (E3) is also real Python: run it
bug = re.search(r'id="l3-ex-checker".*?<pre class="py">(.*?)</pre>', src, re.S).group(1)
ns = {}
exec(html.unescape(bug), ns)
assert ns['check_sort'](lambda a: [], [3, 1, 2]) is True          # the bug: accepts a sort that loses everything
assert ns['check_sort'](sorted, [3, 1, 2]) is True
assert ns['check_sort'](lambda a: a, [3, 1, 2]) is False            # condition 1 is checked
print('listings OK')
