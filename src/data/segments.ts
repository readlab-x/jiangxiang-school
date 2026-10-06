import type { BookMeta, Segment } from './types';
import { yingyao } from './books/yingyao';
import { junma } from './books/junma';
import { zhafei, abao } from './books/zhafei-abao';

export type { Segment, BookMeta };

export const bookSegments: Record<string, Segment[]> = {
  yingyao,
  junma,
  zhafei,
  abao,
};

export const segmentMeta: Record<string, BookMeta> = {
  yingyao: { title: '英耀篇', romanization: 'Ying Yao Pian', nature: '师门大法', role: '原理' },
  junma: { title: '军马篇', romanization: 'Jun Ma Pian', nature: '话术库', role: '话术' },
  zhafei: { title: '扎飞篇', romanization: 'Zha Fei Pian', nature: '神棍仪式', role: '仪式' },
  abao: { title: '阿宝篇', romanization: 'A Bao Pian', nature: '棍骗大法', role: '变现' },
};

export const bookOrder = ['yingyao', 'junma', 'zhafei', 'abao'];

/** 军马篇内部还有更细的分部标注 */
export const subParts: Record<string, string[]> = {
  junma: [
    '论命运',
    '论双关',
    '论颂扬',
    '老人篇',
    '小孩篇',
    '命宫',
    '田宅宫',
    '财帛宫',
    '迁徒宫',
    '官禄宫',
    '福德宫',
    '疾厄宫',
    '夫妻宫',
    '子女宫',
    '仆役宫',
    '兄弟宫',
    '相貌（父母）宫',
  ],
};
