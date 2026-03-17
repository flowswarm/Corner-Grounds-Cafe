
import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { SparklesIcon } from "lucide-react"
import {
    Autoplay,
    EffectCoverflow,
    Navigation,
    Pagination,
} from "swiper/modules"
import { AnimatePresence } from "framer-motion"
import { ImageModal } from "./ImageModal"

interface CarouselProps {
    images: { src: string; alt: string }[]
    autoplayDelay?: number
    showPagination?: boolean
    showNavigation?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
    images,
    autoplayDelay = 2500,
    showPagination = true,
    showNavigation = true,
}) => {
    const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    height: 400px;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  
  .swiper-pagination-bullet {
    background: #FEFAE0; /* Cornsilk */
  }
  
  .swiper-button-next, .swiper-button-prev {
    color: #FEFAE0;
  }
  `
    const [selectedImage, setSelectedImage] = React.useState<{ src: string, alt: string } | null>(null);

    return (
        <section className="w-full py-12 bg-forest overflow-hidden relative">
            <style>{css}</style>
            <div className="mx-auto w-full max-w-[1400px] p-2 relative">
                <div className="relative mx-auto flex w-full flex-col p-4 gap-8 items-center">

                    <div className="flex flex-col justify-center items-center text-center pb-8 w-full">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cornsilk/20 bg-forest/30 px-3 py-1 mb-4">
                            <SparklesIcon className="h-4 w-4 text-caramel fill-caramel/20" />
                            <span className="text-xs font-medium text-cornsilk/80 uppercase tracking-wider">Highlights</span>
                        </div>
                        <div className="flex flex-col gap-2 items-center">
                            <h3 className="font-serif text-3xl md:text-5xl text-cornsilk font-bold tracking-tight">
                                Featured Moments
                            </h3>
                            <p className="text-cornsilk/60 text-lg max-w-md">Snapshots of the daily grind and the people who make it special.</p>
                        </div>
                    </div>

                    <div className="flex w-full items-center justify-center gap-4 relative">
                        {/* Custom Navigation Buttons */}
                        <div className="swiper-button-prev absolute left-4 md:left-0 z-10 !text-cornsilk hover:text-caramel transition-colors after:!text-2xl font-bold cursor-pointer"></div>
                        <div className="swiper-button-next absolute right-4 md:right-0 z-10 !text-cornsilk hover:text-caramel transition-colors after:!text-2xl font-bold cursor-pointer"></div>

                        <div className="w-full px-12">
                            <Swiper
                                spaceBetween={30}
                                enabled={true}
                                autoplay={false}
                                effect={"coverflow"}
                                grabCursor={true}
                                centeredSlides={true}
                                loop={true}
                                slidesPerView={1}
                                breakpoints={{
                                    640: {
                                        slidesPerView: 2,
                                    },
                                    1024: {
                                        slidesPerView: 5,
                                    },
                                }}
                                coverflowEffect={{
                                    rotate: 0,
                                    stretch: 0,
                                    depth: 100,
                                    modifier: 2.5,
                                    slideShadows: false,
                                }}
                                pagination={false}
                                navigation={{
                                    nextEl: ".swiper-button-next",
                                    prevEl: ".swiper-button-prev",
                                }}
                                modules={[EffectCoverflow, Navigation]}
                                className="w-full py-8"
                            >
                                {images.map((image, index) => (
                                    <SwiperSlide key={index}>
                                        <div
                                            className="size-full rounded-2xl overflow-hidden border border-cornsilk/10 shadow-lg cursor-pointer"
                                            onClick={() => setSelectedImage(image)}
                                        >
                                            <img
                                                src={image.src}
                                                className="size-full object-cover transition-transform duration-500 hover:scale-110"
                                                alt={image.alt}
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <ImageModal
                        item={{
                            id: 'carousel-img',
                            title: 'Featured Moment',
                            desc: selectedImage.alt,
                            url: selectedImage.src
                        }}
                        onClose={() => setSelectedImage(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    )
}
