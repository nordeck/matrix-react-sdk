import React from "react";
import { _t } from '../../../languageHandler';
import MeetingButtons from "../../structures/MeetingButtons";
import AutoHideScrollbar from "../../structures/AutoHideScrollbar";
import MeetingList from './MeetingList';
import {Meeting} from "../../../utils/Meeting";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import PropTypes from "prop-types";
interface IProps {
    roomId: string;
}
interface IState {
    meetingsList: Array<Meeting>,
}
export default class MeetingPanel extends React.Component<IProps, IState> {
    meetingsList: Array<Meeting> = [];
    static propTypes = {
        roomId: PropTypes.string,
    }
    static contextType = MatrixClientContext;

    constructor(props: IProps) {
        super(props);
        this.state = {
            meetingsList: [],
        };
        this.getMeetingEventsList = this.getMeetingEventsList.bind(this);
        this.fillMeetingsList = this.fillMeetingsList.bind(this);
        this.onRoomStateEvents = this.onRoomStateEvents.bind(this);
    }

    componentDidMount() {
        this.context.on('RoomState.events', this.onRoomStateEvents);
        this.getMeetingEventsList();
    }

    componentWillUnmount() {
        this.context.removeListener('RoomState.events', this.onRoomStateEvents);
    }

    componentDidUpdate(prevProps, prevState) {
        // check whether client has changed
        if (prevProps.roomId !== this.props.roomId) {
            this.getMeetingEventsList();
        }
    }

    onRoomStateEvents(stateEvent) {
        if (stateEvent.getType() === 'nic.meetings.meeting') {
            this.fillMeetingsList(stateEvent);
        }
    }

    getMeetingEventsList() {
        const room = this.context.getRoom(this.props.roomId);
        if (!room) return;
        const MeetingEvents = room.currentState.getStateEvents('nic.meetings.meeting');
        if (MeetingEvents.length !== 0) {
            for (const meetingEvent of MeetingEvents) {
                this.fillMeetingsList(meetingEvent);
            }
        }
    }

    fillMeetingsList(meetingEvent) {
        if (meetingEvent.getContent().parent_room_id === this.props.roomId) {
            this.meetingsList = this.meetingsList.filter(
                meeting => meeting.meeting_id !== meetingEvent.getContent().meeting_id);
            this.meetingsList.push(meetingEvent.getContent());
            this.setState( {meetingsList: this.meetingsList });
        }
    }

    render() {
        return (
            <div className="mx_MeetingPanel" role="tabpanel">
                <AutoHideScrollbar>
                    <div className="mx_MeetingPanel_wrapper">
                        <div className="mx_MeetingPanel_title">{_t("Meeting History")}</div>
                        <MeetingList key="MeetingList" meetingList={this.state.meetingsList} />
                        <MeetingButtons key="MeetingButtons" />
                    </div>
                </AutoHideScrollbar>
            </div>
        );
    }
}
