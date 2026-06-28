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
  slug?: string | null;
  cover_image_path?: string | null;
}

export default function PortfolioItem({ id, title, description, categories, type, image, images, slug, cover_image_path }: PortfolioItemProps) {
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
    <Link key={id} href={`/portfolio/${slug}?type=${type}`}>
      <motion.div
        className="cursor-pointer bg-white rounded-3xl border border-gray-100 p-3 flex flex-col h-[440px]"
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
        <motion.div className="relative w-full h-[330px] overflow-hidden rounded-2xl bg-gray-100">
          {cover_image_path ? (
            <motion.img
              src={cover_image_path}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              variants={imageVariants}
            />
          ) : images && images.length > 0 ? (
            images.length === 1 ? (
              <motion.img
                src={images[0]}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                variants={imageVariants}
              />
            ) : (
              <div className="grid grid-cols-2 h-full w-full gap-[2px]">
                <div className="relative h-full w-full overflow-hidden">
                  <motion.img
                    src={images[0]}
                    alt={`${title} - 1`}
                    className="absolute inset-0 w-full h-full object-cover"
                    variants={imageVariants}
                  />
                </div>
                <div className="relative h-full w-full overflow-hidden">
                  <motion.img
                    src={images[1]}
                    alt={`${title} - 2`}
                    className="absolute inset-0 w-full h-full object-cover"
                    variants={imageVariants}
                  />
                  {images.length > 2 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white text-3xl font-bold drop-shadow-md">
                        +{images.length - 2}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <motion.img
              src={image}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              variants={imageVariants}
            />
          )}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent rounded-2xl pointer-events-none"
            variants={overlayVariants}
          />

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
          className="mt-3 px-1 flex flex-col justify-between flex-1"
          variants={textVariants}
        >
          <div>
            <motion.h3
              className="text-lg font-semibold line-clamp-1 mb-1"
              variants={titleVariants}
            >
              {title}
            </motion.h3>
            <p className="text-gray-500 text-xs line-clamp-1 mb-2">
              {description || '\u00A0'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-[26px]">
            {categories.slice(0, 3).map((category, index) => (
              <motion.div
                key={index}
                className="inline-flex items-center px-3 pt-0.5 pb-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
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
        </motion.div>
      </motion.div>
    </Link>
  );
}