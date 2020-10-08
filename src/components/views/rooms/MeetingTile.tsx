import React from 'react';
import { Meeting } from '../../../utils/Meeting';
import MatrixClientContext from "../../../contexts/MatrixClientContext";

function msToTime(input) {
    const date = new Date(input);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return hours + ':' + minutes;
}

interface IProps {
    meeting: Meeting;
}

export default class MeetingTile extends React.Component<IProps> {
    static contextType = MatrixClientContext ;
    constructor(props: IProps) {
        super(props);
    }

    render() {
        const meeting = this.props.meeting;
        const meetingStartTime = msToTime(meeting.start_time);
        const meetingEndTime = msToTime(meeting.end_time);
        const date = new Date(meeting.start_time);
        const meetingDate = date.getDate() + "." + date.getMonth() + "." + date.getFullYear();

        const meetingRoom = this.context.getRoom(meeting.room_id);
        const userId = this.context.getUserId();
        const badge = meetingRoom? meeting.room_id === meetingRoom.roomId ?
            meetingRoom.hasMembershipState(userId, "invite")? (
                <span className="badge" aria-hidden="true" />
            ) : null : null: null;
        const vertDivider = <span className="mx_MeetingTile_verticalDivider" />;
        const meetingTitle = meeting.name !== undefined
            ? <div className="mx_MeetingTile_Title">{badge}{ meeting.name }</div>
            : null;
        const dateContainer =
            <div className="mx_meetingTile_TimeContainer">
                <div className="mx_meetingTile_TimeContainer_Date">
                    { meetingDate }
                </div>
                <div className="mx_meetingTile_TimeContainer_TimeSlot">
                    { meetingStartTime } - { meetingEndTime }
                </div>
            </div>;
        const iconContainer =
            <div>
                <span id='iconPlaceholder1'>O</span>
                <span id='iconPlaceholder2'>O</span>
                <span id='iconPlaceholder3'>O</span>
                <span id='iconPlaceholder4'>O</span>
                <span id='iconPlaceholder5'>O</span>
            </div>;

        return (
            <div className='mx_MeetingTile'>
                { meetingTitle }
                <div className='mx_MeetingTile_OverviewContainer'>
                    { dateContainer }
                    { vertDivider }
                    { iconContainer }
                </div>
            </div>
        );
    }
}
