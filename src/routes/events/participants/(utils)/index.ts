import type { AttendanceRecordCollection, ParticipantCollection } from "@/db/models";
import type { ParticipantAttendance } from "@/db/models/types";

export function getPopulatedAttendanceRecords(
  event_id: string,
  collections: {
    attendance_records_collection: AttendanceRecordCollection;
    participant_collection: ParticipantCollection;
  },
  current_event_day?: string
): ParticipantAttendance[] {
  const attendance_records = collections.attendance_records_collection
    .find({
      event_id: event_id,
      ...(current_event_day && { day: current_event_day })
    })
    .fetch();

  const participantIds = [...new Set(attendance_records.map((record) => record.participant_id))];

  const participants = collections.participant_collection
    .find({
      id: { $in: participantIds }
    })
    .fetch();

  const participant_map = new Map(
    participants.map((participant) => [participant.id, participant])
  );

  // return new combined objects without modifying originals
  return attendance_records
    .map((record) => {
      const participant = participant_map.get(record.participant_id);
      return {
        ...record,
        first_name: participant?.first_name,
        middle_name: participant?.middle_name,
        last_name: participant?.last_name,
        email: participant?.email,
        participant
      };
    })
    .sort(
      (a, b) => (b.latest_time_scanned?.getTime() ?? 0) - (a.latest_time_scanned?.getTime() ?? 0)
    ) as ParticipantAttendance[];
}