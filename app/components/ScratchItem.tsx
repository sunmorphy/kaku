// import Image from 'next/image';
import { motion } from 'framer-motion';

interface ScratchItemProps {
  id: string;
  title: string;
  categories: string[];
  image: string;
  description: string;
  onClick: () => void;
}

export default function ScratchItem({ id, title, categories, image, description, onClick }: ScratchItemProps) {
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
        
        {/* Main overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
          variants={overlayVariants}
          transition={{ duration: 0.4 }}
        />
        
        {/* Color overlay effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 mix-blend-overlay"
          variants={overlayVariants}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        
        {/* Text content */}
        <motion.div 
          className="absolute inset-0 flex flex-col justify-end p-6"
          variants={textContainerVariants}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.1
          }}
        >
          <motion.h3 
            className="text-white text-xl font-bold mb-3 drop-shadow-2xl tracking-wide"
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
            {categories.map((category, index) => (
              <motion.div 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                whileHover={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  borderColor: "rgba(255, 255, 255, 0.5)",
                  scale: 1.02,
                  x: 4
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
          </div>
          
          {/* Animated underline */}
          <motion.div 
            className="h-0.5 bg-primary mt-2"
            variants={underlineVariants}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2
            }}
          />
        </motion.div>
        
        {/* Border glow */}
        <motion.div 
          className="absolute inset-0 rounded-2xl border-2 border-primary/30"
          initial={{ opacity: 0 }}
          whileHover={{ 
            opacity: 1,
            boxShadow: "inset 0 0 20px rgba(var(--primary), 0.1)"
          }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Corner accent */}
        <motion.div 
          className="absolute top-0 right-0 bg-primary/15 rounded-bl-2xl"
          initial={{ width: 0, height: 0 }}
          whileHover={{ width: "1.5rem", height: "1.5rem" }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.1
          }}
        />
        
        {/* Floating particles */}
        <motion.div 
          className="absolute top-4 right-4 w-1.5 h-1.5 bg-white/30 rounded-full"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.7 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.2
          }}
        />
        
        <motion.div 
          className="absolute top-6 right-7 w-1 h-1 bg-primary/30 rounded-full"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 0.6 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.25
          }}
        />
      </motion.div>
    </motion.div>
  );
}