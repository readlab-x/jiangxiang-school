import io

REPL = {
    'src/data/books/yingyao.ts': [
        ('别主动填 silence', '别主动找话说'),
        ('你连我家事都算到了', '你连我家的事都算到了'),
        ('"庶出""私逃"都是 dramatic的、让人震惊的判断', '"庶出""私逃"都是耸人听闻的判断'),
        ('这句恭维对女 target 特别有效', '这句恭维对女性目标特别有效'),
        ('对女 target 是杀手级话术', '对女性目标是杀手级话术'),
    ],
    'src/data/books/junma.ts': [
        ('**这一节是全站最值得研究的部分。**', '**这一节最值得研究。**'),
        ('对女 target', '对女性目标'),
        ('对正在管事、 employed 有下属的人', '对正在管事、手下有人的'),
    ],
    'src/data/books/zhafei-abao.ts': [
        ('一个具体的 unmet 需求', '一个具体的、未被满足的需求'),
        ('这与英耀篇的"看 inorganic 先观来意"是同一套逻辑的两面', '这与英耀篇「入门先观来意」是同一套逻辑的两面'),
    ],
}

for f, pairs in REPL.items():
    s = io.open(f, encoding='utf-8').read()
    for a, b in pairs:
        if a in s:
            s = s.replace(a, b)
        else:
            print(f'  MISS {f}: {a[:40]}')
    io.open(f, 'w', encoding='utf-8').write(s)

print('done')
