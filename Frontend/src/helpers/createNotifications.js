import { toast } from "react-toastify";
export const createNotification = (
    type = 'info',
    message = '',
    autoclose = 3000,
    position = "top-right"
) => {
    const autoClose = autoclose === false ? false : 3000;
    switch (type) {
        case "info":
            toast.info(message, { autoClose, position });
            break;
        case "success":
            toast.success(message, { autoClose, position });
            break;
        case "warning":
            toast.warning(message, { autoClose, position });
            break;
        case "error":
            toast.error(message, { autoClose, position });
            break;
    }
};
