type ToastVariant = 'default' | 'destructive' | 'success';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

let toastContainer: HTMLDivElement | null = null;

// Create toast container if it doesn't exist
const ensureToastContainer = () => {
  if (!toastContainer && typeof document !== 'undefined') {
    toastContainer = document.createElement('div');
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

const clearToast = (toast: HTMLDivElement) => {
  if (!toast) return;
  
  toast.classList.add('opacity-0', 'transform', 'translate-x-4');
  setTimeout(() => {
    toast.remove();
  }, 300);
};

export const toast = (options: ToastOptions) => {
  const container = ensureToastContainer();
  if (!container) return;
  
  const { title, description, variant = 'default', duration = 5000 } = options;
  
  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.className = `p-4 border shadow-lg rounded-lg transition-all duration-300 transform ${
    variant === 'destructive' 
      ? 'bg-red-900 border-red-700 text-white' 
      : variant === 'success'
        ? 'bg-green-900 border-green-700 text-white'
        : 'bg-[#2d2d2d] border-[#3c3c3c] text-white'
  } max-w-sm`;
  
  // Create title
  const titleEl = document.createElement('div');
  titleEl.className = 'font-medium';
  titleEl.textContent = title;
  toastEl.appendChild(titleEl);
  
  // Create description if provided
  if (description) {
    const descEl = document.createElement('div');
    descEl.className = 'text-sm opacity-90 mt-1';
    descEl.textContent = description;
    toastEl.appendChild(descEl);
  }
  
  // Add to container
  toastEl.style.opacity = '0';
  toastEl.style.transform = 'translateX(1rem)';
  container.appendChild(toastEl);
  
  // Animate in
  setTimeout(() => {
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateX(0)';
  }, 10);
  
  // Auto-dismiss
  setTimeout(() => {
    clearToast(toastEl);
  }, duration);
};
