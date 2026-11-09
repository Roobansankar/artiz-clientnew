import { Toaster } from 'sonner'

export default function AdminToaster() {
  return <Toaster theme="light" position="top-right" richColors closeButton duration={5000} visibleToasts={3} toastOptions={{ style: { fontFamily: 'var(--font-admin-inter), var(--font-inter), system-ui, sans-serif' } }} />
}
