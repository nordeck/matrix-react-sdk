
import React from 'react';
import PropTypes from 'prop-types';
import BaseDialog from '../dialogs/BaseDialog';
import { _t } from '../../../languageHandler';


export default class CreateMeetingDialog extends React.Component <any, any> {
    displayName = "CreateMeetingDialog";
    propTypes = {
        onFinished: PropTypes.func.isRequired,
        defaultPublic: PropTypes.bool
    }

    public render() {
        const title = _t("Schedule Meeting");
        return(
            // replace className with mx_CreateMeetingDialog
            <BaseDialog className="mx_CreateGroupDialog" onFinished={this.props.onFinished} title={title}>

            </BaseDialog>
        );
    }
}
