import React from "react";
import { _t } from '../../../languageHandler';
import MeetingButtons from "../../structures/MeetingButtons";
import AutoHideScrollbar from "../../structures/AutoHideScrollbar";
import MeetingList from './MeetingList';
import {Meeting} from "../../../utils/Meeting";

export default class MeetingPanel extends React.Component {
    render() {
        return (
            <div className="mx_MeetingPanel" role="tabpanel">
                <AutoHideScrollbar>
                    <div className="mx_MeetingPanel_wrapper">
                        <div className="mx_MeetingPanel_title">{_t("Meeting History")}</div>
                        <MeetingList key="MeetingList" meetingList={exampleList}/>
                        <MeetingButtons key="MeetingButtons" />
                    </div>
                </AutoHideScrollbar>
            </div>
        );
    }
}

// TODO get meetingList from somewhere
const exampleList = Array<Meeting>();
