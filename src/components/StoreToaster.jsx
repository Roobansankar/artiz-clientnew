'use client'

import { Toaster } from 'sonner'

// Storefront toasts, styled to match the Artiz palette. Sits below the sticky header.
export default function StoreToaster() {
  return (
    <Toaster
      position="top-center"
      offset={{ top: 80 }}
      mobileOffset={{ top: 68, left: 16, right: 16 }}
      closeButton
      duration={5000}
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast: '!rounded-2xl !border !border-sand !bg-cream !text-ink !shadow-[0_12px_40px_rgba(73,51,39,0.15)] !font-body !text-[15px]',
          description: '!text-muted',
          success: '[&_[data-icon]]:!text-[#527254]',
          error: '!border-terra/50 [&_[data-icon]]:!text-terra',
          closeButton: '!border-sand !bg-white !text-ink',
        },
      }}
    />
  )
}
