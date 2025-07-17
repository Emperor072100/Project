import toast from 'react-hot-toast';

/**
 * Shows a toast message with a fallback to browser alert
 * @param message Message to display
 * @param type Type of toast (success, error)
 */
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  // Try to show toast
  try {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  } catch (error) {
    console.error("Error showing toast:", error);
    // Fallback to alert if toast fails
    alert(message);
  }
}
