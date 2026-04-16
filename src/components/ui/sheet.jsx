import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

function SheetContent({ className, children, ...props }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "sidebar-panel fixed inset-y-0 left-0 z-50 w-[min(86vw,21rem)] border-r",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-left",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left",
          "duration-300 ease-in-out",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export { Sheet, SheetClose, SheetContent, SheetTrigger }
