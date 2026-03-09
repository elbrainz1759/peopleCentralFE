import { api } from '@/lib/api';

export interface CreateDataTrackerDto {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  recipients: string[];
  notification_periods: number[];
}

export class DataTrackerService {
    private static instance: DataTrackerService;

    private constructor() {}

    public static getInstance(): DataTrackerService {
        if (!DataTrackerService.instance) {
            DataTrackerService.instance = new DataTrackerService();
        }
        return DataTrackerService.instance;
    }

    async createTracker(data: CreateDataTrackerDto): Promise<any> {
        return api.post<any>('/data-tracker', data);
    }

    async getTrackers(): Promise<any> {
        return api.get<any>('/data-tracker');
    }
}

export const trackerService = DataTrackerService.getInstance();
