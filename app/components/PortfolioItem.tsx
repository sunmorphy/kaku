// import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PortfolioItemProps {
  id: string;
  title: string;
  description?: string | null;
  categories: string[];
  type: 'project' | 'artwork';
  image: string;
  images?: string[];
}

export default function PortfolioItem({ id, title, description, categories, type, image, images }: PortfolioItemProps) {
  const isProject = type === 'project';
  const totalImages = images?.length || 1;

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

  const imageVariants = {
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

  const countBadgeVariants = {
    initial: {
      scale: 1,
      opacity: 0.8,
      backdropFilter: "blur(4px)"
    },
    hover: {
      scale: 1.1,
      opacity: 0.95,
      backdropFilter: "blur(2px)"
    }
  };

  return (
    <Link key={id} href={`/portfolio/${id}?type=${type}`}>
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
      >
        {isProject && images && images.length > 1 ? (
          // Project with multiple images - show 2 images side by side
          <motion.div className="relative w-full h-96 overflow-hidden rounded-2xl bg-gray-100 flex border-2 border-transparent">
            <motion.div
              className="relative w-1/2 h-full overflow-hidden"
              whileHover={{ x: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.img
                src={images[0]}
                alt={`${title} - Image 1`}
                className="absolute inset-0 w-full h-full object-cover"
                variants={imageVariants}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  duration: 0.6
                }}
              />
            </motion.div>
            <motion.div
              className="relative w-1/2 h-full overflow-hidden"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.img
                src={images[1] || images[0]}
                alt={`${title} - Image 2`}
                className="absolute inset-0 w-full h-full object-cover"
                variants={imageVariants}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  duration: 0.6
                }}
              />
              {totalImages > 2 && (
                <motion.div
                  className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm"
                  variants={countBadgeVariants}
                >
                  <motion.span
                    className="text-white text-2xl font-bold drop-shadow-lg"
                    whileHover={{
                      scale: 1.3,
                      fontSize: "2rem",
                      textShadow: "0 0 20px rgba(255,255,255,0.5)"
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    +{totalImages - 1}
                  </motion.span>
                </motion.div>
              )}
            </motion.div>

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
        ) : (
          // Single image for artworks or single-image projects
          <motion.div className="relative w-full h-96 overflow-hidden rounded-2xl bg-gray-100 border-2 border-transparent">
            <motion.img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              variants={imageVariants}
            />
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
        )}

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