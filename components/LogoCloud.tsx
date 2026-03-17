import { motion } from "framer-motion";

export default function LogoCloud() {
    const logos = [
        { src: "/feature0.JPG", alt: "Partner 1" },
        { src: "/feature1.JPG", alt: "Partner 2" },
        { src: "/feature2.JPG", alt: "Partner 3" },
        { src: "/feature3.JPG", alt: "Partner 4" },
        { src: "/feature4.JPG", alt: "Partner 5" },
        { src: "/feature5.JPG", alt: "Partner 6" },
    ]

    return (
        <section className="bg-forest py-16 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6">
                <h2 className="text-center text-lg font-medium text-cornsilk/80 uppercase tracking-widest mb-12">
                    Featured In
                </h2>

                <div className="relative flex w-full overflow-hidden mask-gradient">
                    {/* Gradient Masks for fade effect at edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-forest to-transparent z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-forest to-transparent z-10"></div>

                    <motion.div
                        className="flex gap-16 items-center whitespace-nowrap"
                        animate={{ x: "-25%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 54
                        }}
                        style={{ width: "max-content" }}
                    >
                        {/* 4 Sets for Seamless Looping */}
                        {[...logos, ...logos, ...logos, ...logos].map((logo, index) => (
                            <div key={index} className="h-24 w-40 md:h-32 md:w-56 shrink-0 flex items-center justify-center">
                                <img
                                    className="h-full w-full object-contain p-4 opacity-80 hover:opacity-100 transition-opacity duration-300"
                                    src={logo.src}
                                    alt={logo.alt}
                                />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
