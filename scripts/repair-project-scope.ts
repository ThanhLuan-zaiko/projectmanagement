import { db, insert } from '@/config';

const FALLBACK_PROJECT_ID = '00000000-0000-0000-0000-000000000001';
const APPLY_MODE = process.argv.includes('--apply');

type RowRecord = Record<string, unknown> & {
  project_id?: string;
  work_item_id?: string;
  expert_id?: string;
  estimate_id?: string;
  schedule_id?: string;
};

type WorkItemMap = {
  projectByWorkItemId: Map<string, string>;
  ambiguousWorkItemIds: Set<string>;
};

function logSection(title: string) {
  console.log(`\n=== ${title} ===`);
}

function buildInsertOperation(table: string, row: RowRecord) {
  const { query, params } = insert(table, row);
  return { query, params };
}

async function fetchRowsByFallbackProject(table: string): Promise<RowRecord[]> {
  const result = await db.execute<RowRecord>(`SELECT * FROM ${table} WHERE project_id = ? LIMIT 1000`, {
    params: [FALLBACK_PROJECT_ID],
  });
  return result.rows;
}

async function buildWorkItemMap(): Promise<WorkItemMap> {
  const result = await db.execute<RowRecord>('SELECT project_id, work_item_id FROM work_items LIMIT 5000');
  const projectByWorkItemId = new Map<string, string>();
  const ambiguousWorkItemIds = new Set<string>();

  for (const row of result.rows) {
    const workItemId = String(row.work_item_id || '');
    const projectId = String(row.project_id || '');

    if (!workItemId || !projectId) {
      continue;
    }

    const existingProjectId = projectByWorkItemId.get(workItemId);
    if (existingProjectId && existingProjectId !== projectId) {
      ambiguousWorkItemIds.add(workItemId);
      continue;
    }

    projectByWorkItemId.set(workItemId, projectId);
  }

  return { projectByWorkItemId, ambiguousWorkItemIds };
}

async function repairWorkItemScopedTable(
  table: 'expert_time_estimates' | 'cost_estimates' | 'work_item_schedules',
  rows: RowRecord[],
  workItemMap: WorkItemMap
) {
  let repaired = 0;
  let unresolved = 0;

  for (const row of rows) {
    const workItemId = String(row.work_item_id || '');
    const currentProjectId = String(row.project_id || '');
    const targetProjectId = workItemMap.projectByWorkItemId.get(workItemId);

    if (!workItemId || !currentProjectId) {
      unresolved++;
      console.log(`[skip] ${table}: missing work_item_id/project_id`);
      continue;
    }

    if (workItemMap.ambiguousWorkItemIds.has(workItemId)) {
      unresolved++;
      console.log(`[skip] ${table}: ambiguous work_item_id ${workItemId}`);
      continue;
    }

    if (!targetProjectId || targetProjectId === currentProjectId) {
      unresolved++;
      console.log(`[skip] ${table}: unable to infer target project for work_item_id ${workItemId}`);
      continue;
    }

    const repairedRow = {
      ...row,
      project_id: targetProjectId,
    };

    if (APPLY_MODE) {
      const operations = [buildInsertOperation(table, repairedRow)];

      if (table === 'expert_time_estimates') {
        operations.push({
          query: 'DELETE FROM expert_time_estimates WHERE project_id = ? AND work_item_id = ? AND expert_id = ? AND estimate_id = ?',
          params: [
            currentProjectId,
            row.work_item_id,
            row.expert_id,
            row.estimate_id,
          ],
        });
      } else if (table === 'cost_estimates') {
        operations.push({
          query: 'DELETE FROM cost_estimates WHERE project_id = ? AND work_item_id = ? AND estimate_id = ?',
          params: [
            currentProjectId,
            row.work_item_id,
            row.estimate_id,
          ],
        });
      } else {
        operations.push({
          query: 'DELETE FROM work_item_schedules WHERE project_id = ? AND work_item_id = ?',
          params: [
            currentProjectId,
            row.work_item_id,
          ],
        });
      }

      await db.batch(operations);
    }

    repaired++;
    console.log(
      `[${APPLY_MODE ? 'repair' : 'dry-run'}] ${table}: ${workItemId} ${currentProjectId} -> ${targetProjectId}`
    );
  }

  console.log(
    `${table}: total=${rows.length}, ${APPLY_MODE ? 'repaired' : 'repairable'}=${repaired}, unresolved=${unresolved}`
  );
}

async function reportProjectScheduleLeaks() {
  const rows = await fetchRowsByFallbackProject('project_schedules');
  console.log(`project_schedules: total=${rows.length}, auto-repairable=0, unresolved=${rows.length}`);
  for (const row of rows) {
    console.log(`[report] project_schedules: schedule_id=${String(row.schedule_id || '')}`);
  }
}

async function main() {
  console.log(`Project scope repair mode: ${APPLY_MODE ? 'APPLY' : 'DRY_RUN'}`);
  console.log(`Fallback project_id: ${FALLBACK_PROJECT_ID}`);

  const workItemMap = await buildWorkItemMap();
  console.log(`Loaded work item project map: ${workItemMap.projectByWorkItemId.size} items`);

  logSection('expert_time_estimates');
  await repairWorkItemScopedTable(
    'expert_time_estimates',
    await fetchRowsByFallbackProject('expert_time_estimates'),
    workItemMap
  );

  logSection('cost_estimates');
  await repairWorkItemScopedTable(
    'cost_estimates',
    await fetchRowsByFallbackProject('cost_estimates'),
    workItemMap
  );

  logSection('work_item_schedules');
  await repairWorkItemScopedTable(
    'work_item_schedules',
    await fetchRowsByFallbackProject('work_item_schedules'),
    workItemMap
  );

  logSection('project_schedules');
  await reportProjectScheduleLeaks();
}

main()
  .catch((error) => {
    console.error('Project scope repair failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.disconnect();
  });
