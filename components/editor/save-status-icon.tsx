import { AnimatePresence, motion } from 'framer-motion'
import { Check, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SaveStatus } from '@/types/editor'

interface SaveStatusIconProps {
  status: SaveStatus
  onClick: () => void
}

export default function SaveStatusIcon({ status, onClick }: SaveStatusIconProps) {
  return (
    <Button variant="ghost" className="w-8 h-8" onClick={onClick} disabled={status === SaveStatus.Saving}>
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.1 }}
        >
          {(() => {
            switch (status) {
              case SaveStatus.Saved:
                return <Check className="w-4 h-4" />;
              case SaveStatus.Unsaved:
                return <Save className="w-4 h-4" />;
              case SaveStatus.Saving:
                return <Save className="w-4 h-4" />;
              case SaveStatus.Error:
                return <X className="w-4 h-4" />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    </Button>
  )
}
