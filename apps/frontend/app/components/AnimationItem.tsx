import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';

interface AnimationItemProps {
    id: string;
    title: string;
    description?: string | null;
    categories: string[];
    videos: string[];
}

export default function AnimationItem({ id, title, description, categories, videos }: AnimationItemProps) {
    const totalVideos = videos.length;
    const previewVideo = videos[0];
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(err => {
                // Ignore autoplay errors
                console.log('Video play failed:', err);
            });
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0; // Reset to start
        }
    };

    const cardVariants = {
        initial: {
            y: 0,
            scale: 1,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        },
        hover: {
            y: -6,
            scale: 1.01,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }
    };

    const videoVariants = {
        initial: {
            scale: 1,
            filter: "brightness(100%) contrast(100%)"
        },
        hover: {
            scale: 1.05,
            filter: "brightness(105%) contrast(102%)"
        }
    };

    const overlayVariants = {
        initial: { opacity: 0 },
        hover: { opacity: 1 }
    };

    const textVariants = {
        initial: { x: 0, y: 0 },
        hover: { x: 2, y: 0 }
    };

    const titleVariants = {
        initial: { x: 0, color: "#1f2937" },
        hover: { x: 4, color: "var(--color-primary)" }
    };

    return (
        <Link key={id} href={`/animations/${id}`}>
            <motion.div
                className="cursor-pointer p-1"
                variants={cardVariants}
                initial="initial"
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Video Preview */}
                <motion.div className="relative w-full h-96 overflow-hidden rounded-2xl bg-gray-100 border-2 border-transparent">
                    <motion.video
                        ref={videoRef}
                        src={previewVideo}
                        className="absolute inset-0 w-full h-full object-cover"
                        variants={videoVariants}
                        loop
                        muted
                        playsInline
                    />

                    {/* Video count badge */}
                    {totalVideos > 1 && (
                        <motion.div
                            className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                            initial={{ opacity: 0.8 }}
                            whileHover={{ opacity: 1, scale: 1.05 }}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            {totalVideos}
                        </motion.div>
                    )}

                    <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent rounded-2xl"
                        variants={overlayVariants}
                    />

                    {/* Animated border glow */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-primary/20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileHover={{
                            opacity: 1,
                            scale: 1,
                            boxShadow: "inset 0 0 20px rgba(var(--color-primary), 0.1)"
                        }}
                        transition={{ duration: 0.3 }}
                    />
                </motion.div>

                <motion.div
                    className="my-8 px-2"
                    variants={textVariants}
                >
                    <div className="mb-4">
                        <motion.h3
                            className="text-xl font-semibold mb-4"
                            variants={titleVariants}
                        >
                            {title}
                        </motion.h3>
                        {description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {description}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category, index) => (
                                <motion.div
                                    key={index}
                                    className="inline-flex items-center px-3 pt-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                                    whileHover={{
                                        backgroundColor: "rgba(var(--color-primary), 0.1)",
                                        borderColor: "rgba(var(--color-primary), 0.3)",
                                        color: "rgba(var(--color-primary), 0.8)",
                                        scale: 1.02
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                >
                                    {category}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </Link>
    );
}
