// import Image from 'next/image';
import { motion } from 'framer-motion';

interface ScratchItemProps {
  id: string;
  title: string;
  categories: string[];
  image: string;
  images?: string[]; // For projects with multiple images
  description: string;
  onClick: () => void;
}

export default function ScratchItem({ id, title, categories, image, images, description, onClick }: ScratchItemProps) {
  const hasMultipleImages = images && images.length > 1;
  const displayImages = images?.slice(0, 4) || [image];
  const remainingCount = images && images.length > 4 ? images.length - 4 : 0;

  const cardVariants = {
    initial: {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    }
  };

  const imageVariants = {
    initial: {
      scale: 1,
      filter: "brightness(100%) contrast(100%)"
    },
    hover: {
      scale: 1.08,
      filter: "brightness(105%) contrast(102%)"
    }
  };

  const gridImageVariants = {
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

  const textContainerVariants = {
    initial: { opacity: 0, y: 10 },
    hover: { opacity: 1, y: 0 }
  };

  const titleVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 }
  };

  const underlineVariants = {
    initial: { width: 0 },
    hover: { width: "3rem" }
  };

  const countBadgeVariants = {
    initial: {
      scale: 1,
      opacity: 0.9
    },
    hover: {
      scale: 1.1,
      opacity: 1
    }
  };

  return (
    <motion.div
      key={id}
      className="cursor-pointer"
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      onClick={onClick}
    >
      <motion.div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-gray-100 border-2 border-transparent">
        {hasMultipleImages ? (
          // Grid mosaic for multiple images
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
            {displayImages.map((img, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden bg-gray-200"
                variants={gridImageVariants}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: index * 0.05
                }}
              >
                <motion.img
                  src={img}
                  alt={`${title} - ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Show count badge on last image if there are more */}
                {index === 3 && remainingCount > 0 && (
                  <motion.div
                    className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm"
                    variants={countBadgeVariants}
                  >
                    <motion.span
                      className="text-white text-3xl font-bold drop-shadow-lg"
                      whileHover={{
                        scale: 1.2,
                        textShadow: "0 0 20px rgba(255,255,255,0.5)"
                      }}
                    >
                      +{remainingCount}
                    </motion.span>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          // Single image with overlay
          <>
            <motion.img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              variants={imageVariants}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                duration: 0.7
              }}
            />

            {/* Color overlay effect for single images */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 mix-blend-overlay"
              variants={overlayVariants}
              transition={{ duration: 0.5, delay: 0.1 }}
            />
          </>
        )}

        {/* Main overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          variants={overlayVariants}
          transition={{ duration: 0.4 }}
        />

        {/* Text content */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-end p-4"
          variants={textContainerVariants}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.1
          }}
        >
          <motion.h3
            className="text-white text-lg font-bold mb-2 drop-shadow-2xl tracking-wide line-clamp-2"
            variants={titleVariants}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20
            }}
          >
            {title}
          </motion.h3>

          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((category, index) => (
              <motion.div
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                whileHover={{
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  scale: 1.05
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                {category}
              </motion.div>
            ))}
            {categories.length > 2 && (
              <motion.div
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm"
              >
                +{categories.length - 2}
              </motion.div>
            )}
          </div>

          {/* Image count badge for multiple images */}
          {hasMultipleImages && (
            <motion.div
              className="mt-2 inline-flex items-center gap-1 text-white text-xs font-semibold"
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              {images!.length} images
            </motion.div>
          )}
        </motion.div>

        {/* Border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-primary/30"
          initial={{ opacity: 0 }}
          whileHover={{
            opacity: 1,
            boxShadow: "inset 0 0 20px rgba(61, 113, 189, 0.1)"
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}