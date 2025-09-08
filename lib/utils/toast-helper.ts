// Simple placeholder for toast-helper
// Replace with your actual toast logic as needed

type ToastArg = string | { title: string; description?: string; variant?: string };

export function showToast(arg: ToastArg) {
  if (typeof arg === 'string') {
    console.log('Toast:', arg);
  } else {
    // You can integrate with your toast/notification library here
    console.log('Toast:', arg.title, arg.description, arg.variant);
  }
}

export const toast = showToast;
