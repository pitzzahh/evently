import { AttendanceRecordCollection, EventScheduleCollection, EventDetailsCollection, ParticipantCollection, QRCodeCollection } from "./models";

export class Collections {
  private static instance: Collections;

  public ATTENDANCE_RECORDS_COLLECTION: AttendanceRecordCollection;
  public EVENT_SCHEDULE_COLLECTION: EventScheduleCollection;
  public EVENT_DETAILS_COLLECTION: EventDetailsCollection;
  public PARTICIPANT_COLLECTION: ParticipantCollection;
  public QRCODE_COLLECTION: QRCodeCollection;

  private constructor() {
    this.ATTENDANCE_RECORDS_COLLECTION = new AttendanceRecordCollection();
    this.EVENT_SCHEDULE_COLLECTION = new EventScheduleCollection();
    this.EVENT_DETAILS_COLLECTION = new EventDetailsCollection();
    this.PARTICIPANT_COLLECTION = new ParticipantCollection();
    this.QRCODE_COLLECTION = new QRCodeCollection();
  }

  public static getInstance(): Collections {
    if (!Collections.instance) {
      Collections.instance = new Collections();
    }
    return Collections.instance;
  }
}

export const COLLECTIONS = Collections.getInstance();