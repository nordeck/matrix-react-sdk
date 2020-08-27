
import React from 'react';
import BaseDialog from '../dialogs/BaseDialog';
import { _t } from '../../../languageHandler';

interface IProps {
    defaultPublic?: boolean;
    onFinished(): void;
}

export default class CreateMeetingDialog extends React.Component<IProps> {
    public render() {
        const title = _t("Schedule Meeting");
        return(
            // replace className with mx_CreateMeetingDialog
            <BaseDialog className="mx_CreateGroupDialog" onFinished={this.props.onFinished} title={title}>

            </BaseDialog>
        );
    }
}
