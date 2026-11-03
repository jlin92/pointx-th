import { motion } from 'framer-motion';
import { useDemo } from '@/app/DemoContext';
import { chapterIdByKey } from '@/app/chapters';
import { Icon } from '@/components/ui/Icon';

/** Floating entry to the POINTX assistant (Shopping Muse). */
export function AssistantFab() {
  const { goToChapter } = useDemo();
  return (
    <motion.button
      type="button"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => goToChapter(chapterIdByKey('muse'))}
      aria-label="Open POINTX assistant"
      className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 rounded-full muse-gradient py-2.5 pl-3 pr-4 text-white shadow-float animate-pulseGlow"
    >
      <Icon name="auto_awesome" filled className="text-[20px]" />
      <span className="text-[12px] font-semibold">Ask</span>
    </motion.button>
  );
}
