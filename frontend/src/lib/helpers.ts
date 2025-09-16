import toast from "react-hot-toast";

type Id = { current: string | null };

const notifySuccessToastId: Id = { current: null };
const errorToastId: Id = { current: null };

// Function to notify success, avoiding duplicate toasts
export const NotifySuccess = (msg: string) => {
    // Check if there's an active success toast
    if (notifySuccessToastId.current) {
        toast.dismiss(notifySuccessToastId.current); // Dismiss the current toast
    }

    // Show a new success toast and store its ID
    notifySuccessToastId.current = toast.success(msg, {
        duration: 8000
    });
};

// Function to notify error, avoiding duplicate toasts
export const NotifyError = (msg: string, durationInMs?: number) => {
    try {
        // Check if there's an active error toast
        if (errorToastId.current) {
            toast.dismiss(errorToastId.current); // Dismiss the current toast
        }

        // Show a new error toast and store its ID
        errorToastId.current = toast.error(msg, {
            duration: durationInMs || 5000
        });

    } catch (error) {
        console.log("🚀 ~ NotifyError ~ error:", error)
    }
};
