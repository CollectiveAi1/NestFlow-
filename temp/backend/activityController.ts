import { Activity, ActivityType } from '../types';

// Mock database interface
interface Database {
  saveActivity: (activity: any) => Promise<Activity>;
  notifyParents: (activity: Activity) => Promise<void>;
}

const mockDb: Database = {
  saveActivity: async (data) => ({ id: 'new-id-' + Date.now(), ...data, timestamp: new Date().toLocaleTimeString() }),
  notifyParents: async () => console.log('Simulating Push Notification to Parents...'),
};

/**
 * Request DTO for creating an activity
 */
interface CreateActivityDto {
  childIds: string[]; // Supports tagging multiple children (bulk update)
  type: ActivityType;
  title: string;
  description?: string;
  mediaBase64?: string; // In production, upload to S3/GCS first and send URL
  authorId: string;
}

/**
 * Activity Controller (Framework agnostic logic)
 * 
 * Handles business logic for keeping parents updated.
 */
export class ActivityController {
  
  async createActivity(reqBody: CreateActivityDto): Promise<Activity[]> {
    const { childIds, type, title, description, mediaBase64, authorId } = reqBody;

    // 1. Validation
    if (!childIds || childIds.length === 0) {
      throw new Error("At least one child must be selected.");
    }

    // 2. Logic: Create individual activity records for each tagged child
    const createdActivities: Activity[] = [];

    for (const childId of childIds) {
      // In a real app, we would process the image here (resize/upload)
      const mediaUrl = mediaBase64 ? "https://storage.nestflow.app/uploads/mock-image.jpg" : undefined;

      const newActivity = await mockDb.saveActivity({
        childId,
        type,
        title,
        description,
        mediaUrl,
        authorName: "Staff Member (Lookup)", // Would lookup author from DB
        createdAt: new Date(),
      });

      createdActivities.push(newActivity);

      // 3. Side Effect: Real-time Notification
      // Use WebSocket to push to connected Parent clients
      await this.emitRealTimeUpdate(childId, newActivity);

      // 4. Side Effect: Push Notification
      await mockDb.notifyParents(newActivity);
    }

    return createdActivities;
  }

  private async emitRealTimeUpdate(childId: string, activity: Activity) {
    console.log(`[WebSocket] Emitting 'activity.new' to channel: child_${childId}`);
    // io.to(`child_${childId}`).emit('activity.new', activity);
  }
}

// Example usage
/*
const controller = new ActivityController();
controller.createActivity({
  childIds: ['1', '2'],
  type: ActivityType.PHOTO,
  title: 'Tower Building',
  description: 'They built a huge tower together!',
  authorId: 'staff_123'
}).then(res => console.log(res));
*/