import subprocess, sys, os
from itertools import permutations, combinations
from math import comb, factorial
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, '.')
from listing1 import *

# Listing 2 output
out = subprocess.run([sys.executable, 'listing2.py'], capture_output=True, text=True, check=True).stdout.split()
assert out == ['5', 'True', 'False', 'True', 'False'], out

def ext(items, rel):
    b = lambda x, y: (x, y) in rel
    return [p for p in permutations(items) if is_sorted_by(p, b)]

tasks = {("a","c"),("b","c"),("b","d")}
e = ext("abcd", tasks)
assert sorted(''.join(p) for p in e) == sorted("abcd abdc bacd badc bdac".split()) and len(e) == 5
# neighbour trap
traps = sorted(''.join(p) for p in permutations("abcd")
               if is_sorted_neighbours(p, lambda x,y:(x,y) in tasks) and not is_sorted_by(p, lambda x,y:(x,y) in tasks))
assert traps == ['bcda','cdab','dabc'], traps
# out-of-order pairs of 7 2 9 4
xs=[7,2,9,4]
oop=[(xs[i],xs[j]) for i in range(4) for j in range(i+1,4) if xs[j]<xs[i]]
assert oop==[(7,2),(7,4),(9,4)] and comb(4,2)==6
# requests
assert len(ext([7,2,9,4], set((x,y) for x in [7,2,9,4] for y in [7,2,9,4] if x<y)))==1
ages={'Ana':30,'Ben':25,'Cy':30,'Dee':22}
r=ext(list(ages), set((p,q) for p in ages for q in ages if ages[p]<ages[q]))
assert len(r)==2 and ('Dee','Ben','Ana','Cy') in r and ('Dee','Ben','Cy','Ana') in r
beats={('rock','scissors'),('scissors','paper'),('paper','rock')}
assert len(ext(['rock','paper','scissors'],beats))==0
assert not is_sorted_by(('rock','scissors','paper'), lambda x,y:(x,y) in beats)
# Q3, Q4, E2
assert len(ext("abc",{("a","b"),("a","c")}))==2
assert len(ext("abcd",{("a","b")}))==12
assert len(ext("abcd",{("a","b"),("c","d")}))==6 and comb(4,2)==6
# E3 not transitive but one arrangement
assert [''.join(p) for p in ext("abc",{("a","b"),("b","c")})]==['abc']
# E4
nb=lambda x,y: y-x>1
e4=[''.join(map(str,p)) for p in permutations([1,2,3,4,5]) if is_sorted_by(p,nb)]
assert sorted(e4)==sorted("12345 21345 13245 12435 12354 21435 21354 13254".split()) and len(e4)==8
assert [len([p for p in permutations(range(1,n+1)) if is_sorted_by(p,nb)]) for n in range(1,6)]==[1,2,3,5,8]
# Q6, Q9
assert 1000-1==999 and comb(1000,2)==499500
assert factorial(2)*factorial(1)*factorial(3)==12 and factorial(6)==720 and 2+1+3==6
# B tiers
assert factorial(1)*factorial(1)*factorial(2)==2
# noticeably-smaller example
assert nb(1.0,2.2) and not nb(1.0,1.5) and not nb(1.5,2.2)
assert is_sorted_neighbours([2.2,1.5,1.0],nb) and not is_sorted_by([2.2,1.5,1.0],nb)
# heights
assert not nb(170,170.6) is None
h=lambda x,y: y-x>=1
assert not h(170,170.6) and not h(170.6,171.2) and h(170,171.2)
# Q8 divisors on 1..12: partial not weak: 2~3, 3~4, 2<4
div=lambda x,y: x!=y and y%x==0
assert not div(2,3) and not div(3,2) and not div(3,4) and not div(4,3) and div(2,4)
# E1 buggy
import buggy
assert buggy.is_sorted_neighbours([1,3,2],lambda x,y:x<y) is True
assert is_sorted_neighbours([1,3,2],lambda x,y:x<y) is False
# e(P) of Q1 proper subset: {1},{2} unrelated
# Fib 2.. checked. Closure of RPS demands rock<rock
exec(open("check_v2.py").read())
print("all checks passed")
