import React from "react"
import { motion } from "framer-motion"

interface HighlightItem {
    id: number
    title: string // The script text (e.g., "Latte Art")
    image: string
    alt: string
}

interface FeaturedHighlightsProps {
    items: HighlightItem[]
}

export const FeaturedHighlights: React.FC<FeaturedHighlightsProps> = ({ items }) => {
    return (
        <section className="w-full py-10 sm:py-16 bg-forest text-cornsilk">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl uppercase tracking-widest mb-4">
                        Featured Moments
                    </h2>
                    <div className="h-0.5 w-24 bg-caramel mx-auto opacity-60"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group relative aspect-[3/4] overflow-hidden rounded-lg cursor-pointer"
                        >
                            {/* Image */}
                            <img
                                src={item.image}
                                alt={item.alt}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

                            {/* Script Text */}
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                <h3
                                    className="font-script text-3xl sm:text-5xl md:text-6xl text-cornsilk drop-shadow-lg transform -rotate-6 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110"
                                    style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
                                >
                                    {item.title}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
