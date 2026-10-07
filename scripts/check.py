import io, re, sys

files = [
    'src/data/books/yingyao.ts',
    'src/data/books/junma.ts',
    'src/data/books/zhafei-abao.ts',
]

TRAD = set('態羆籌壽學萬與醜聲說話氣慶應聯輝龜藥籲觀羅國華嚴儀價眾優兒內別勝勢場節個豐傳傷倆倫偉側備傑傾債僑億儲黨關興點務動勞勳勵勸辦衛衝裝覺')

total = 0
for f in files:
    s = io.open(f, encoding='utf-8').read()
    texts = re.findall(r"text: '(.+?)',\n    note:", s, re.S)
    nos = [int(x) for x in re.findall(r'no: (\d+)', s)]
    total += len(texts)
    print('===', f, '段数', len(texts), '编号连续' if nos == list(range(1, len(nos)+1)) else f'编号异常{nos}')

    for i, t in enumerate(texts, 1):
        # 繁体残留
        trad = sorted({c for c in t if c in TRAD})
        if trad:
            print(f'  [繁] 第{i}段: {"".join(trad)}')
        # 连续重复
        dup = False
        for L in range(8, 24):
            for k in range(0, len(t) - 2 * L, 2):
                if t[k:k+L] == t[k+L:k+2*L]:
                    print(f'  [重] 第{i}段: "{t[k:k+L]}"')
                    dup = True
                    break
            if dup:
                break
        # 单字重复（同一句号内）
        for seg in re.split(r'[。？]', t):
            if len(seg) > 10:
                half = len(seg) // 2
                if seg[:half] == seg[half:half*2]:
                    print(f'  [重] 第{i}段 半句重复: "{seg[:half]}"')

print('总段数:', total)
