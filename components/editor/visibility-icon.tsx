import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VisibilityIconProps {
  visibility: 'PUBLIC' | 'PRIVATE'
  onClick: () => void
}

export default function VisibilityIcon({ visibility, onClick }: VisibilityIconProps) {
  return (
    <Button
      variant="ghost"
      className="w-8 h-8"
      onClick={onClick}
      title={visibility === 'PUBLIC' ? '公開' : '私密'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={visibility}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.1 }}
        >
          {visibility === 'PUBLIC' ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  )
}
