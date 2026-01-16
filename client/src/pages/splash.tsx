import { useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import logoIcon from "@assets/2_801_(1)_1768527810027.png";

export default function Splash() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <Layout hidePattern>
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-black mb-12 font-heading tracking-wide">
            Welcome to Simplicity!
          </h1>
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center"
          >
            <img 
              src={logoIcon} 
              alt="Simplicity Logo" 
              className="w-24 h-24 object-contain"
            />
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
}
