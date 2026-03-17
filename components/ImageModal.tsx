import { motion } from "framer-motion"
import { X } from "lucide-react"
import React from "react"

export interface ImageItem {
    id: number | string
    title: string
    desc: string
    url: string
    span?: string
}

interface ImageModalProps {
    item: ImageItem
    onClose: () => void
}

export const ImageModal: React.FC<ImageModalProps> = ({ item, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={item.url}
                    alt={item.title}
                    className="h-auto max-h-[90vh] w-full rounded-lg object-contain"
                />
            </motion.div>
            <button
                onClick={onClose}
                className="absolute right-4 top-4 text-white/80 transition-colors hover:text-white"
                aria-label="Close image view"
            >
                <X size={24} />
            </button>
        </motion.div>
    )
}
