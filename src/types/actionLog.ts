export type ActionType = 'field_change' | 'item_change' | 'skill_change' | 'equipment_change';

export interface ActionLogEntry {
  timestamp: string;
  actorId: number;
  actionType: ActionType;
  details: {
    key: string;
    oldValue: number;
    delta: number;
  };
}

export interface ActionLogResponse {
  entries: ActionLogEntry[];
  total: number;
}
