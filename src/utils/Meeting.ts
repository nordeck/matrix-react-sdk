//import Utils from "./Utils";

export class Meeting {

    event_id: string;
    meeting_id: string;
    name: string;
    topic: string;
    parent_room_id: string;
    parent_room_name: string;
    parent_room_url: string;
    room_id: string;
    room_url: string;
    room_name: string;
    start_time: number;
    end_time: number;
    creator: string;

    previous_start_time: number;
    previous_end_time: number;
    previous_participants: number;

    status: MeetingStatus;
    participants: string[];
    widgets: string[];

    constructor() {
        this.initialize();
    }

    initialize() {
        //this.meeting_id = Utils.<randomUUID>();
        this.status = "CREATED";
    }

    toString() {
        return JSON.stringify(this);
    }

    static toMeeting(event: any) : Meeting {
        const meeting = new Meeting();
        meeting.event_id = event["event_id"];
        meeting.meeting_id = event["content"]["meeting_id"];
        meeting.name = event["content"]["name"];
        meeting.topic = event["content"]["topic"];
        meeting.parent_room_id = event["content"]["parent_room_id"];
        meeting.parent_room_name = event["content"]["parent_room_name"];
        meeting.parent_room_url = event["content"]["parent_room_url"];
        meeting.room_id = event["content"]["room_id"];
        meeting.room_url = event["content"]["room_url"];
        meeting.room_name = event["content"]["room_name"];
        meeting.start_time = event["content"]["start_time"];
        meeting.end_time = event["content"]["end_time"];
        meeting.status = event["content"]["status"];
        meeting.participants = event["content"]["participants"];
        meeting.widgets = event["content"]["widgets"];
        meeting.creator = event["content"]["creator"];

        if (event["unsigned"]["prev_content"]) {
            meeting.previous_start_time = event["unsigned"]["prev_content"]["start_time"];
            meeting.previous_end_time = event["unsigned"]["prev_content"]["end_time"];
            meeting.previous_participants = event["unsigned"]["prev_content"]["participants"];
        }

        return meeting;
    }
}

export type MeetingStatus = "CREATED" | "PLANNED" | "UPDATED" | "STARTED" | "FINISHED" | "CANCELLED";
