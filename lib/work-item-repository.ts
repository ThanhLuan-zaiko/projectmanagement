// Work Item Repository
import { BaseRepository } from './repository';
import { db } from '@/config';

export interface WorkItem extends Record<string, unknown> {
  work_item_id: string;
  project_id: string;
  title: string;
  description: string;
  work_type: 'task' | 'subtask' | 'milestone' | 'bug';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: Date;
  updated_at: Date;
  created_by: string;
  assigned_to: string | null;
  due_date: Date | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  parent_work_item_id: string | null;
  tags: string[];
  attachments: string[];
}

export class WorkItemRepository extends BaseRepository<WorkItem> {
  protected tableName = 'work_items';
  protected primaryKey = 'work_item_id';

  // Find work items by project
  async findByProjectId(projectId: string, options?: { limit?: number }): Promise<WorkItem[]> {
    const limit = options?.limit ?? 100;
    const query = `SELECT * FROM work_items WHERE project_id = ? LIMIT ${limit}`;
    const result = await db.execute<WorkItem>(query, { params: [projectId] });
    return result.rows;
  }

  // Find work items by status
  async findByStatus(projectId: string, status: string): Promise<WorkItem[]> {
    const query = 'SELECT * FROM work_items WHERE project_id = ? AND status = ?';
    const result = await db.execute<WorkItem>(query, { params: [projectId, status] });
    return result.rows;
  }

  // Find work items by assignee
  async findByAssignee(assigneeId: string): Promise<WorkItem[]> {
    const query = 'SELECT * FROM work_items WHERE assigned_to = ? ALLOW FILTERING';
    const result = await db.execute<WorkItem>(query, { params: [assigneeId] });
    return result.rows;
  }

  // Find work items by priority
  async findByPriority(projectId: string, priority: string): Promise<WorkItem[]> {
    const query = 'SELECT * FROM work_items WHERE project_id = ? AND priority = ?';
    const result = await db.execute<WorkItem>(query, { params: [projectId, priority] });
    return result.rows;
  }

  // Find work items by type
  async findByWorkType(projectId: string, workType: string): Promise<WorkItem[]> {
    const query = 'SELECT * FROM work_items WHERE project_id = ? AND work_type = ?';
    const result = await db.execute<WorkItem>(query, { params: [projectId, workType] });
    return result.rows;
  }

  // Search work items by title/description
  async search(projectId: string, searchTerm: string): Promise<WorkItem[]> {
    const query = 'SELECT * FROM work_items WHERE project_id = ?';
    const result = await db.execute<WorkItem>(query, { params: [projectId] });
    
    return result.rows.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Find work items by creator
  async findByCreator(createdBy: string): Promise<WorkItem[]> {
    const query = 'SELECT * FROM work_items WHERE created_by = ? ALLOW FILTERING';
    const result = await db.execute<WorkItem>(query, { params: [createdBy] });
    return result.rows;
  }

  // Get work items with due date before a specific date
  async getOverdueItems(projectId: string, beforeDate: Date): Promise<WorkItem[]> {
    const query = 'SELECT * FROM work_items WHERE project_id = ? AND due_date < ? AND status != ? ALLOW FILTERING';
    const result = await db.execute<WorkItem>(query, { 
      params: [projectId, beforeDate, 'done'] 
    });
    return result.rows;
  }

  // Get work items due in the next N days
  async getUpcomingDueItems(projectId: string, days: number): Promise<WorkItem[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const query = 'SELECT * FROM work_items WHERE project_id = ? AND due_date >= ? AND due_date <= ? ALLOW FILTERING';
    const result = await db.execute<WorkItem>(query, { 
      params: [projectId, now, futureDate] 
    });
    return result.rows;
  }

  // Update work item status
  async updateStatus(workItemId: string, projectId: string, status: string): Promise<WorkItem | null> {
    return this.update(workItemId, { status } as Partial<WorkItem>, {
      params: [projectId]
    });
  }

  // Update work item assignee
  async updateAssignee(workItemId: string, projectId: string, assigneeId: string): Promise<WorkItem | null> {
    return this.update(workItemId, { assigned_to: assigneeId } as Partial<WorkItem>, {
      params: [projectId]
    });
  }

  // Add tag to work item
  async addTag(workItemId: string, projectId: string, tag: string): Promise<WorkItem | null> {
    const workItem = await this.findById(workItemId, { params: [projectId] });
    if (!workItem) return null;

    const tags = workItem.tags ? [...workItem.tags, tag] : [tag];
    return this.update(workItemId, { tags } as Partial<WorkItem>, {
      params: [projectId]
    });
  }

  // Remove tag from work item
  async removeTag(workItemId: string, projectId: string, tag: string): Promise<WorkItem | null> {
    const workItem = await this.findById(workItemId, { params: [projectId] });
    if (!workItem) return null;

    const tags = workItem.tags ? workItem.tags.filter(t => t !== tag) : [];
    return this.update(workItemId, { tags } as Partial<WorkItem>, {
      params: [projectId]
    });
  }

  // Delete work item (soft delete by setting status to cancelled)
  async softDelete(workItemId: string, projectId: string): Promise<WorkItem | null> {
    return this.updateStatus(workItemId, projectId, 'cancelled');
  }
}

export const workItemRepository = new WorkItemRepository();
