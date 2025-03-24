import { AttendanceRecordCollection, EventScheduleCollection, EventDetailsCollection, ParticipantCollection, SettingsCollection } from "./models";
class Collections {
  private static instance: Collections;

  public ATTENDANCE_RECORDS_COLLECTION: AttendanceRecordCollection;
  public EVENT_SCHEDULE_COLLECTION: EventScheduleCollection;
  public EVENT_DETAILS_COLLECTION: EventDetailsCollection;
  public PARTICIPANT_COLLECTION: ParticipantCollection;
  public SETTINGS_COLLECTION: SettingsCollection;

  private constructor() {
    this.ATTENDANCE_RECORDS_COLLECTION = new AttendanceRecordCollection();
    this.EVENT_SCHEDULE_COLLECTION = new EventScheduleCollection();
    this.EVENT_DETAILS_COLLECTION = new EventDetailsCollection();
    this.PARTICIPANT_COLLECTION = new ParticipantCollection();
    this.SETTINGS_COLLECTION = new SettingsCollection();
  }

  public static getInstance(): Collections {
    if (!Collections.instance) {
      Collections.instance = new Collections();
    }
    return Collections.instance;
  }
}

export const COLLECTIONS = Collections.getInstance();