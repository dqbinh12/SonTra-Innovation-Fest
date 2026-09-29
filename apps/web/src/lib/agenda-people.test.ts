import assert from 'node:assert/strict';
import test from 'node:test';
import { groupAgendaPeople } from './agenda-people';

test('groups structured agenda people by display role and ignores blank entries', () => {
  assert.deepEqual(
    groupAgendaPeople([
      { role: 'co_chair', name: 'Nguyễn Huy Bình', title: 'PCT UBND phường' },
      { role: 'speaker', name: 'TS. Phạm Đình Lâm' },
      { role: 'participant', name: 'Đại biểu tham dự hội thảo' },
      { role: 'speaker', name: '  ' },
    ]),
    [
      {
        role: 'co_chair',
        people: [{ role: 'co_chair', name: 'Nguyễn Huy Bình', title: 'PCT UBND phường' }],
      },
      { role: 'speaker', people: [{ role: 'speaker', name: 'TS. Phạm Đình Lâm' }] },
      {
        role: 'participant',
        people: [{ role: 'participant', name: 'Đại biểu tham dự hội thảo' }],
      },
    ],
  );
});
