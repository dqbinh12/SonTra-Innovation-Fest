import type { AgendaPerson, AgendaPersonRole } from '@sif/shared';

export interface GroupedAgendaPeople {
  role: AgendaPersonRole;
  people: AgendaPerson[];
}

export function groupAgendaPeople(people?: AgendaPerson[] | null): GroupedAgendaPeople[] {
  if (!people || !Array.isArray(people)) return [];

  const groups: GroupedAgendaPeople[] = [];
  const map = new Map<AgendaPersonRole, AgendaPerson[]>();

  for (const item of people) {
    if (!item || !item.name || !item.name.trim()) continue;
    const cleanItem: AgendaPerson = {
      role: item.role,
      name: item.name.trim(),
      ...(item.title && item.title.trim() ? { title: item.title.trim() } : {}),
      ...(item.organization && item.organization.trim()
        ? { organization: item.organization.trim() }
        : {}),
    };

    const existing = map.get(item.role);
    if (existing) {
      existing.push(cleanItem);
    } else {
      const list = [cleanItem];
      map.set(item.role, list);
      groups.push({ role: item.role, people: list });
    }
  }

  return groups;
}
