"""生成方案 B 配色：朱红=原文/强调，靛蓝=注解，其余中性化。
所有值先在这里算好并输出对比度，再写进 CSS。"""

def lum(h):
    h = h.lstrip('#')
    r, g, b = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def cr(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def sat(h):
    """粗略饱和度：max-min over max"""
    h = h.lstrip('#')
    r, g, b = [int(h[i:i+2], 16) for i in (0, 2, 4)]
    mx, mn = max(r, g, b), min(r, g, b)
    return 0 if mx == 0 else (mx - mn) / mx

LIGHT = {
    'paper':   '#faf8f4',
    'card':    '#ffffff',
    'head-bg': '#ffffff',
    'line':    '#e4dfd6',
    'th-bg':   '#f2efe8',
    'code-bg': '#f0ece3',
    'note-bg': '#f4f1ea',

    'ink':       '#1c1b19',
    'ink-soft':  '#57534e',
    'ink-faint': '#8a857f',

    'accent':       '#9a2b1e',   # 朱红：原文
    'accent-soft':  '#f5e8e4',
    'accent-line':  '#e8d5d0',

    'note':       '#2c5282',     # 靛蓝：注解
    'note-soft':  '#e6ecf4',
    'note-line':  '#cbd8e8',

    'code-bg':  '#f0ece3',
    'pre-bg':   '#2a2825',
    'pre-ink':  '#e8e4dc',
    'on-ink':   '#faf8f4',
    'mark':     '#b8863a',      # 引文标记：低饱和赭
    'mark-soft':'#f7f0e2',
}

DARK = {
    'paper':   '#15171a',
    'card':    '#1c1f23',
    'head-bg': '#191c20',
    'line':    '#282c32',
    'th-bg':   '#212429',
    'code-bg': '#23262b',
    'note-bg': '#1f2227',

    'ink':       '#ddd9d1',
    'ink-soft':  '#9d9customs',   # placeholder, fixed below
    'ink-faint': '#6f6b64',

    # 朱红：降饱和，不提亮到刺眼
    'accent':       '#c07a68',
    'accent-soft':  '#2e201c',
    'accent-line':  '#4a332c',

    # 靛蓝：降饱和
    'note':       '#7d9cc4',
    'note-soft':  '#1c2430',
    'note-line':  '#2e3d52',

    'code-bg': '#22252a',
    'pre-bg':  '#101215',
    'pre-ink': '#cfcbc3',
    'on-ink':  '#15171a',
    'mark':      '#9c8055',
    'mark-soft': '#282319',
}
DARK['ink-soft'] = '#9a958c'

print('=== 亮色 ===')
for k in ['accent', 'note', 'mark']:
    print(f'{k:8} {LIGHT[k]}  饱和度 {sat(LIGHT[k]):.2f}')
print()
print('=== 暗色（关键：饱和度要降下来，不能比亮色更高）===')
for k in ['accent', 'note', 'mark']:
    print(f'{k:8} {DARK[k]}  饱和度 {sat(DARK[k]):.2f}  (亮色 {sat(LIGHT[k]):.2f})')

print()
print('=== 对比度检查 ===')
checks = [
    ('正文', LIGHT['ink'], LIGHT['paper'], 4.5),
    ('次要文字', LIGHT['ink-soft'], LIGHT['paper'], 4.5),
    ('弱文字', LIGHT['ink-faint'], LIGHT['paper'], 3.0),
    ('链接', LIGHT['accent'], LIGHT['paper'], 4.5),
    ('注解栏文字', LIGHT['note'], LIGHT['paper'], 4.5),
    ('暗色正文', DARK['ink'], DARK['paper'], 4.5),
    ('暗色次要', DARK['ink-soft'], DARK['paper'], 4.5),
    ('暗色链接', DARK['accent'], DARK['paper'], 4.5),
    ('暗色注解', DARK['note'], DARK['paper'], 4.5),
    ('按钮未选中', DARK['ink-faint'], DARK['head-bg'], 3.0),
]
for name, fg, bg, need in checks:
    v = cr(fg, bg)
    flag = 'OK ' if v >= need else '!! '
    print(f'{flag}{name:12} {cr(fg,bg):5.2f}  需≥{need}')

print()
print('=== 按钮选中态：目标 5:1（不用纯反色）===')
for label, fg, bg in [
    ('亮色 选中', LIGHT['accent'], LIGHT['accent-soft']),
    ('暗色 选中', DARK['accent'], '#3a2a24'),
]:
    print(f'{label:10} {cr(fg,bg):5.2f}  ({fg} on {bg})')
