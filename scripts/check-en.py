import io, re

files = [
    'src/data/books/yingyao.ts',
    'src/data/books/junma.ts',
    'src/data/books/zhafei-abao.ts',
]

# 允许保留的专有名词
OK = {'Barnum', 'Forer', 'Effect', 'Cold', 'Reading', 'Hot', 'commit'}

for f in files:
    s = io.open(f, encoding='utf-8').read()
    notes = re.findall(r"note: '(.+?)',\n    tag:", s, re.S)
    for i, n in enumerate(notes, 1):
        for w in re.findall(r'[a-zA-Z]{3,}', n):
            if w in OK:
                continue
            print(f"{f.split('/')[-1]} 第{i}段: {w}")
