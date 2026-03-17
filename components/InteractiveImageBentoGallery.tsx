"use client"

import React, { useRef, useState, useEffect } from "react"
import {
    motion,
    useScroll,
    useTransform,
    AnimatePresence,
} from "framer-motion"
import { cn } from "../lib/utils"
import { ImageModal, ImageItem } from "./ImageModal"

// Defines the props for the main gallery component
interface InteractiveImageBentoGalleryProps {
    imageItems: ImageItem[]
    title: string
    description: string
}

// Animation variants for the container to stagger children
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
        },
    },
}

// Animation variants for each gallery item
const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 },
    },
}

// Main gallery component
const InteractiveImageBentoGallery: React.FC<
    InteractiveImageBentoGalleryProps
> = ({ imageItems, title, description }) => {
    const [selectedItem, setSelectedItem] = useState<ImageItem | null>(null)
    const [dragConstraint, setDragConstraint] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    // Calculate the draggable area constraint
    useEffect(() => {
        const calculateConstraints = () => {
            if (gridRef.current && containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth
                const gridWidth = gridRef.current.scrollWidth
                // The '- 32' provides some padding at the end
                const newConstraint = Math.min(0, containerWidth - gridWidth - 32)
                setDragConstraint(newConstraint)
            }
        }

        calculateConstraints()
        window.addEventListener("resize", calculateConstraints)
        return () => window.removeEventListener("resize", calculateConstraints)
    }, [imageItems])

    // Framer Motion scroll animations
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    })
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
    const y = useTransform(scrollYProgress, [0, 0.2], [30, 0])

    return (
        <section
            ref={targetRef}
            className="relative w-full overflow-hidden bg-forest py-16 sm:py-24"
        >
            <motion.div
                style={{ opacity, y }}
                className="container mx-auto px-4 text-center"
            >
                <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-cornsilk">
                    {title}
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-cornsilk/80">
                    {description}
                </p>
            </motion.div>

            <div
                ref={containerRef}
                className="relative mt-12 w-full cursor-grab active:cursor-grabbing"
            >
                <motion.div
                    className="w-max"
                    drag="x"
                    dragConstraints={{ left: dragConstraint, right: 0 }}
                    dragElastic={0.05}
                >
                    <motion.div
                        ref={gridRef}
                        className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-4 px-4 md:px-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {imageItems.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                className={cn(
                                    "group relative flex h-full min-h-[15rem] w-full min-w-[15rem] cursor-pointer items-end overflow-hidden rounded-xl border border-cornsilk/10 bg-forest/50 p-4 shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cornsilk focus-visible:ring-offset-2 focus-visible:ring-offset-forest",
                                    item.span,
                                )}
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onClick={() => setSelectedItem(item)}
                                onKeyDown={(e) => e.key === "Enter" && setSelectedItem(item)}
                                tabIndex={0}
                                aria-label={`View ${item.title}`}
                            >
                                <img
                                    src={item.url}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="relative z-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                    <h3 className="text-lg font-bold text-cornsilk">{item.title}</h3>
                                    <p className="mt-1 text-sm text-cornsilk/80">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedItem && (
                    <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
                )}
            </AnimatePresence>
        </section>
    )
}

export default InteractiveImageBentoGallery 
