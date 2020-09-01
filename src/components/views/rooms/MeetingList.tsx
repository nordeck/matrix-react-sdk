import React from 'react';
import MeetingTile from "./MeetingTile";
import { Meeting } from '../../../utils/Meeting';

interface IProps {
    meetingList: Array<Meeting>;
}

export default class MeetingList extends React.Component<IProps> {
    constructor(props: IProps) {
        super(props);
    }

    render() {
        return (
            <div>
                { this.props.meetingList.sort(sortByStartingDate).map(entry => {
                    return <MeetingTile meeting={ entry } key={ entry.meeting_id } />
                })}
            </div>
        );
    }
}

function sortByStartingDate(a: Meeting, b: Meeting) : number{
    return a.start_time - b.start_time;
}
