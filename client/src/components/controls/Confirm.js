import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export const showConfirmDialog = (title, message, yesFunc, noFunc) => {
    confirmAlert({
        title: title,
        message: message,
        buttons: [
            { label: 'Yes', onClick: yesFunc },
            { label: 'No', onClick: noFunc }
        ]
    });
}