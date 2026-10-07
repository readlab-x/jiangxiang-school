import io, re

f = 'src/data/books/yingyao.ts'
s = io.open(f, encoding='utf-8').read()

# 提取每段的 trans（去重）与 no/text/note/tag
lines = s.split('\n')

# 先把所有 trans 行收集起来（按出现顺序，同一译文去重保留首个）
trans_lines = []
seen = set()
for l in lines:
    st = l.strip()
    if st.startswith('trans:'):
        if st not in seen:
            seen.add(st)
            trans_lines.append(l)

print('唯一 trans 行:', len(trans_lines))

# 重置文件：移除所有 trans 行
lines = [l for l in lines if not l.strip().startswith('trans:')]

# 逐段重新插入：找到每个 text 行，在其后插入对应 trans
result = []
ti = 0
for l in lines:
    result.append(l)
    st = l.strip()
    if st.startswith('text: ') and st.endswith("',") and ti < len(trans_lines):
        indent = l[:len(l) - len(l.lstrip())]
        result.append(indent + trans_lines[ti].strip())
        ti += 1

io.open(f, 'w', encoding='utf-8').write('\n'.join(result))
print('重新插入:', ti)
