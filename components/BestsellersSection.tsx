
import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Swiper as SwiperType } from 'swiper';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

interface BestsellerItem {
    id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    link: string;
}

const BESTSELLERS: BestsellerItem[] = [
    {
        id: '1',
        title: 'Signature Latte',
        description: 'Rich espresso meets velvety oat milk, finished with our house-made vanilla bean syrup.',
        image: '/menu8.jpg',
        category: 'Coffee',
        link: '/menu/product/signature-latte'
    },
    {
        id: '2',
        title: 'Morning Bun',
        description: 'Flaky, buttery pastry dusted with cinnamon sugar and orange zest. The perfect start.',
        image: '/gallery14.jpg',
        category: 'Pastry',
        link: '/menu/product/morning-bun'
    },
    {
        id: '3',
        title: 'Cold Brew',
        description: 'Steeped for 24 hours for a smooth, bold flavor with notes of chocolate and cherry.',
        image: '/menu11.jpg',
        category: 'Cold Coffee',
        link: '/menu/product/cold-brew'
    },
    {
        id: '4',
        title: 'Bagel',
        description: 'Freshly baked bagel toasted to perfection, served with cream cheese or your choice of spread.',
        image: '/menu6.jpg',
        category: 'Food',
        link: '/menu/product/bagel'
    },
    {
        id: '5',
        title: 'Matcha Latte',
        description: 'Premium ceremonial grade matcha whisked to perfection with your choice of milk.',
        image: '/menu12.jpg',
        category: 'Tea',
        link: '/menu/product/matcha-latte'
    },
];

const BestsellersSection: React.FC = () => {
    const swiperRef = useRef<SwiperType | null>(null);

    return (
        <section className="py-24 bg-forest relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-caramel rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-olive rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <h2 className="font-serif text-5xl md:text-6xl text-cornsilk">
                            Our <span className="text-caramel italic">Bestsellers</span>
                        </h2>
                        <p className="text-cornsilk/70 text-lg font-light leading-relaxed">
                            Discover the flavors that our community loves most. From our signature roasts to fresh-baked goods, these are the daily rituals of Corner Grounds.
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => swiperRef.current?.slidePrev()}
                            className="w-12 h-12 rounded-full border border-cornsilk/20 flex items-center justify-center text-cornsilk hover:bg-caramel hover:text-forest hover:border-caramel transition-all duration-300 group"
                            aria-label="Previous slide"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => swiperRef.current?.slideNext()}
                            className="w-12 h-12 rounded-full border border-cornsilk/20 flex items-center justify-center text-cornsilk hover:bg-caramel hover:text-forest hover:border-caramel transition-all duration-300 group"
                            aria-label="Next slide"
                        >
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <Swiper
                    modules={[Navigation]}
                    onBeforeInit={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    spaceBetween={32}
                    slidesPerView={1.2}
                    centeredSlides={false}
                    loop={true}
                    breakpoints={{
                        640: {
                            slidesPerView: 2.2,
                        },
                        1024: {
                            slidesPerView: 3.2,
                        },
                    }}
                    className="w-full !overflow-visible"
                >
                    {BESTSELLERS.map((item) => (
                        <SwiperSlide key={item.id} className="h-auto">
                            <div className="group h-full flex flex-col bg-white/5 backdrop-blur-sm border border-cornsilk/5 rounded-2xl overflow-hidden hover:border-caramel/30 transition-all duration-500">
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent opacity-60" />
                                    <div className="absolute top-4 right-4 bg-caramel/90 text-forest text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                        {item.category}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-serif text-cornsilk mb-2 group-hover:text-caramel transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-cornsilk/60 font-light leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    <Link to={item.link} className="pt-4 flex items-center text-sm font-medium text-caramel uppercase tracking-widest border-t border-cornsilk/10 mt-auto cursor-pointer hover:opacity-80 transition-opacity">
                                        <span>Order Now</span>
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
};

export default BestsellersSection;
