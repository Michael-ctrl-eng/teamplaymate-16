import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Star, Users, BarChart3, FileText, ArrowRight, Play, Zap, Shield, Target, X, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HumanizedHelperBot } from '../components/HumanizedHelperBot';

const Index = () => {
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { scrollYProgress } = useScroll();
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Enhanced animations with more dynamic effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 100, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9, rotateX: 15 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    hover: {
      y: -15,
      scale: 1.05,
      rotateX: -5,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      x: [0, 5, 0],
      rotate: [0, 2, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const magneticVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const textRevealVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  const backgroundParticles = {
    animate: {
      y: [0, -100, 0],
      x: [0, 50, 0],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        repeatDelay: 2
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.main 
        className="min-h-screen transition-all duration-700 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 z-50"
          style={{
            scaleX: scrollYProgress,
            transformOrigin: "0%"
          }}
        />

        {/* Enhanced Navigation */}
        <motion.nav 
          className="sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-500 bg-black/20 border-gray-800"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <img 
                  src="/lovable-uploads/01b5bf86-f2e7-42cd-9465-4d0bb347d2ea.png" 
                  alt="Statsor" 
                  className="h-12 w-auto rounded-xl object-cover"
                />
              </motion.div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="hover:text-green-500 transition-colors font-medium">
                  {language === 'en' ? 'Home' : 'Inicio'}
                </Link>
                <a href="#features" className="hover:text-green-500 transition-colors font-medium">
                  {language === 'en' ? 'Features' : 'Funciones'}
                </a>
                <Link to="/pricing" className="hover:text-green-500 transition-colors font-medium">
                  {language === 'en' ? 'Pricing' : 'Precios'}
                </Link>
                <a href="#demo" className="hover:text-green-500 transition-colors font-medium">
                  {language === 'en' ? 'Demo' : 'Demo'}
                </a>
                <a href="#contact" className="hover:text-green-500 transition-colors font-medium">
                  {language === 'en' ? 'Contact' : 'Contacto'}
                </a>
                <Link to="/signin">
                  <Button variant="outline" className="border-2">
                    {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Enhanced Hero Section - Cursor.com Style */}
        <motion.section 
          className="min-h-screen flex items-center justify-center relative overflow-hidden"
          variants={heroVariants}
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-purple-400 opacity-60"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + i * 10}%`,
                }}
                variants={backgroundParticles}
                animate="animate"
                transition={{
                  delay: i * 0.5,
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Enhanced Background Gradients */}
            <motion.div 
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl bg-purple-500"
              variants={floatingVariants}
              animate="animate"
            />
            <motion.div 
              className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl bg-blue-500"
              variants={floatingVariants}
              animate="animate"
              transition={{ delay: 1 }}
            />
          </div>

          <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
            <motion.div
              variants={itemVariants}
              className="mb-12"
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-[0.9] tracking-tight">
                {[
                  { text: language === 'en' ? 'Build' : 'Construye', delay: 0 },
                  { text: language === 'en' ? 'football' : 'fútbol', delay: 0.2 },
                  { text: language === 'en' ? 'faster' : 'más rápido', delay: 0.4, gradient: true }
                ].map((word, i) => (
                  <motion.span
                    key={i}
                    className={`block ${
                      word.gradient
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'
                        : theme === 'dark' ? 'text-white' : 'text-black'
                    }`}
                    variants={textRevealVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                  >
                    {word.text}
                  </motion.span>
                ))}
              </h1>
              <motion.p 
                className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent"
                variants={textRevealVariants}
                initial="hidden"
                animate="visible"
                custom={3}
              >
                {language === 'en'
                  ? 'The AI-powered football analytics platform. Built for coaches who want to make data-driven decisions.'
                  : 'La plataforma de análisis de fútbol con IA. Construida para entrenadores que quieren tomar decisiones basadas en datos.'
                }
              </motion.p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            >
              <motion.div 
                variants={magneticVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/signup">
                  <Button 
                    size="lg"
                    className="px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 interactive-element shadow-lg bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 hover:shadow-xl hover:scale-105"
                  >
                    {language === 'en' ? 'Try for free' : 'Prueba gratis'}
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div 
                variants={magneticVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowDemo(true)}
                  className="px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 interactive-element group text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-600 hover:border-gray-400"
                >
                  {language === 'en' ? 'Watch demo' : 'Ver demo'}
                  <motion.div
                    className="ml-2 inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>

            {/* Minimal Stats */}
            <motion.div
              variants={itemVariants}
              className="text-sm font-medium bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-transparent"
            >
              {language === 'en' 
                ? 'Trusted by 500+ teams • 10K+ active coaches • 99% satisfaction'
                : 'Confiado por 500+ equipos • 10K+ entrenadores activos • 99% satisfacción'
              }
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Features Section */}
        <motion.section 
          id="features"
          className="py-24"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'en' ? 'Functions' : 'Funciones'}
              </h2>
              <p className="text-xl opacity-80 max-w-3xl mx-auto">
                {language === 'en' 
                  ? 'Tools specifically designed for coaches looking to improve their team\'s performance'
                  : 'Herramientas diseñadas específicamente para entrenadores que buscan mejorar el rendimiento de tu equipo'
                }
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {[
                {
                  icon: Users,
                  title: language === 'en' ? 'Training Upload' : 'Carga de entrenamientos',
                  description: language === 'en' 
                    ? 'Plan and schedule your sessions with customizable templates. Organize exercises and manage workloads.'
                    : 'Planifica y programa tus sesiones con plantillas personalizables. Organiza ejercicios y gestiona cargas de trabajo.',
                  color: 'from-blue-500 to-blue-600',
                  accent: 'blue'
                },
                {
                  icon: BarChart3,
                  title: language === 'en' ? 'Attendance Control' : 'Control de asistencia',
                  description: language === 'en'
                    ? 'Automatic tracking of player participation. Identify patterns and maintain attendance records.'
                    : 'Seguimiento automático de la participación de jugadores. Identifica patrones y mantén récords de presencia.',
                  color: 'from-green-500 to-green-600',
                  accent: 'green'
                },
                {
                  icon: Target,
                  title: language === 'en' ? 'Player Statistics' : 'Estadísticas por jugador',
                  description: language === 'en'
                    ? 'Detailed analysis of individual performance. Specific metrics for each position and evolution over time.'
                    : 'Análisis detallado del rendimiento individual. Métricas específicas para cada posición y evolución a lo largo del tiempo.',
                  color: 'from-yellow-500 to-orange-500',
                  accent: 'orange'
                },
                {
                  icon: FileText,
                  title: language === 'en' ? 'Automatic Reports' : 'Informes automáticos',
                  description: language === 'en'
                    ? 'Generate complete reports on the team and players. Share professional documents with directors or parents.'
                    : 'Genera reportes completos sobre el equipo y jugadores. Comparte documentos profesionales con directivos o padres.',
                  color: 'from-red-500 to-red-600',
                  accent: 'red'
                }
              ].map((feature, index) => {
                const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
                const [isHovered, setIsHovered] = React.useState(false);
                const cardRef = React.useRef<HTMLDivElement>(null);

                const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
                  if (!cardRef.current) return;
                  const rect = cardRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setMousePosition({ x, y });
                };

                const handleMouseEnter = () => setIsHovered(true);
                const handleMouseLeave = () => {
                  setIsHovered(false);
                  setMousePosition({ x: 0, y: 0 });
                };

                const tiltX = isHovered ? (mousePosition.y - 150) / 10 : 0;
                const tiltY = isHovered ? (mousePosition.x - 150) / -10 : 0;

                return (
                <motion.div
                  key={index}
                  ref={cardRef}
                  className="group relative p-8 rounded-2xl border-2 transition-all duration-500 cursor-pointer overflow-hidden bg-gray-900/50 border-gray-800 hover:border-gray-600 hover:bg-gray-800/70"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  whileHover={{
                    scale: 1.05,
                    rotateX: tiltX,
                    rotateY: tiltY,
                    z: 50
                  }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: 1000
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* 3D Cursor Follower */}
                  <motion.div
                    className="absolute pointer-events-none z-10"
                    animate={{
                      x: mousePosition.x - 10,
                      y: mousePosition.y - 10,
                      opacity: isHovered ? 1 : 0
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  >
                    <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${feature.color} blur-sm`} />
                  </motion.div>

                  {/* Interactive Light Effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: isHovered 
                        ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1), transparent 40%)`
                        : 'none'
                    }}
                  />

                  {/* Animated background glow */}
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-r ${feature.color} blur-xl`}
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  />
                  
                  <motion.div 
                    className={`relative w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                    animate={{
                      rotateX: isHovered ? tiltX * 0.5 : 0,
                      rotateY: isHovered ? tiltY * 0.5 : 0,
                      scale: isHovered ? 1.1 : 1,
                      z: isHovered ? 30 : 0
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 25 
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <motion.div
                      animate={{
                        rotate: isHovered ? [0, -10, 10, 0] : 0
                      }}
                      transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
                    >
                      <feature.icon className="h-8 w-8 text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3 
                    className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                    animate={{
                      x: isHovered ? 5 : 0,
                      z: isHovered ? 20 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    className={`leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    animate={{
                      x: isHovered ? 5 : 0,
                      z: isHovered ? 15 : 0
                    }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {feature.description}
                  </motion.p>
                  
                  {/* Enhanced 3D Hover arrow indicator */}
                  <motion.div
                    className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    animate={{
                      x: isHovered ? 0 : -10,
                      z: isHovered ? 25 : 0,
                      rotateZ: isHovered ? 360 : 0
                    }}
                    transition={{ 
                      duration: 0.5,
                      rotateZ: { duration: 2, repeat: isHovered ? Infinity : 0, ease: "linear" }
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <ArrowRight className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} drop-shadow-lg`} />
                  </motion.div>

                  {/* 3D Floating Particles */}
                  {isHovered && [
                    { x: 20, y: 30, delay: 0 },
                    { x: 80, y: 50, delay: 0.2 },
                    { x: 150, y: 40, delay: 0.4 },
                    { x: 200, y: 60, delay: 0.6 }
                  ].map((particle, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} opacity-60`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: [particle.y, particle.y - 20, particle.y],
                        x: particle.x
                      }}
                      transition={{
                        duration: 2,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Modality Section */}
        <motion.section 
          className="py-24"
          variants={itemVariants}
        >
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              variants={itemVariants}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'en' ? 'Adapted to your modality' : 'Adaptado a tu modalidad'}
              </h2>
              <p className="text-xl opacity-80 max-w-3xl mx-auto">
                {language === 'en'
                  ? 'Statsor adapts perfectly to both soccer 11 and futsal, with specific functionalities for each modality.'
                  : 'Statsor se adapta perfectamente tanto a fútbol 11 como a futsal, con funcionalidades específicas para cada modalidad.'
                }
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Soccer 11 */}
              <motion.div
                className="p-8 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 text-white"
                variants={cardVariants}
                whileHover="hover"
              >
                <h3 className="text-2xl font-bold mb-6">Fútbol 11</h3>
                <ul className="space-y-4">
                  {[
                    language === 'en' ? 'Extensive squad management (up to 25 players)' : 'Gestión de plantillas amplias (hasta 25 jugadores)',
                    language === 'en' ? 'Tactical analysis for 11vs11 formations' : 'Análisis táctico para formaciones 11vs11',
                    language === 'en' ? 'Specific position tracking' : 'Seguimiento de posiciones específicas',
                    language === 'en' ? 'Full match statistics (90 min)' : 'Estadísticas de partidos completos (90 min)',
                    language === 'en' ? 'Complete season planning' : 'Planificación de temporada completa'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Futsal */}
              <motion.div
                className="p-8 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white"
                variants={cardVariants}
                whileHover="hover"
              >
                <h3 className="text-2xl font-bold mb-6">Futsal</h3>
                <ul className="space-y-4">
                  {[
                    language === 'en' ? 'Intensive rotation control' : 'Control de rotaciones intensivas',
                    language === 'en' ? 'Small space game analysis' : 'Análisis de juego en espacio reducido',
                    language === 'en' ? 'Intensity and rhythm metrics' : 'Métricas de intensidad y ritmo',
                    language === 'en' ? 'Match statistics (40 min)' : 'Estadísticas de partidos (40 min)',
                    language === 'en' ? 'Double competition management' : 'Gestión de dobles competiciones'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section - Cursor.com Style */}
        <motion.section 
          className="py-32"
          variants={itemVariants}
        >
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              className="text-center mb-20"
              variants={itemVariants}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-blue-300 to-slate-300 bg-clip-text text-transparent">
                {language === 'en' ? 'Loved by coaches' : 'Amado por entrenadores'}
              </h2>
              <p className={`text-xl max-w-2xl mx-auto ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {language === 'en'
                  ? 'See what coaches around the world are saying about Statsor'
                  : 'Ve lo que dicen los entrenadores de todo el mundo sobre Statsor'
                }
              </p>
            </motion.div>

            {/* Enhanced Rolling Testimonials */}
            <div className="relative overflow-hidden">
              {/* Enhanced gradient overlays for seamless edge blending */}
              <div className="absolute left-0 top-0 bottom-0 w-48 z-20 pointer-events-none bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-48 z-20 pointer-events-none bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent" />
              {/* Additional subtle inner gradients for ultra-smooth blending */}
              <div className="absolute left-48 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-gray-900/20 to-transparent" />
              <div className="absolute right-48 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-gray-900/20 to-transparent" />
              
              <motion.div
                className="flex space-x-8"
                animate={{
                  x: [0, -2016] // Move by exact width of 6 testimonials (6 * 336px)
                }}
                transition={{
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop"
                }}
                style={{
                  width: 'calc(200% + 64px)' // Ensure enough width for seamless loop
                }}
              >
                {/* Duplicate testimonials for seamless loop */}
                {[...Array(2)].map((_, duplicateIndex) => [
                  {
                    name: 'Sarah Chen',
                    role: language === 'en' ? 'Head Coach, FC Barcelona Women' : 'Entrenadora Principal, FC Barcelona Femenino',
                    quote: language === 'en'
                      ? 'Statsor has completely transformed how we analyze our games. The AI insights are incredibly accurate.'
                      : 'Statsor ha transformado completamente cómo analizamos nuestros juegos. Los insights de IA son increíblemente precisos.',
                    avatar: 'SC',
                    gradient: 'from-blue-500 to-purple-500'
                  },
                  {
                    name: 'Marcus Johnson',
                    role: language === 'en' ? 'Technical Director, Manchester City' : 'Director Técnico, Manchester City',
                    quote: language === 'en'
                      ? 'The most intuitive football analytics platform I\'ve ever used. Our decision-making has improved dramatically.'
                      : 'La plataforma de análisis de fútbol más intuitiva que he usado. Nuestra toma de decisiones ha mejorado dramáticamente.',
                    avatar: 'MJ',
                    gradient: 'from-green-500 to-blue-500'
                  },
                  {
                    name: 'Elena Rodriguez',
                    role: language === 'en' ? 'Performance Analyst, Real Madrid' : 'Analista de Rendimiento, Real Madrid',
                    quote: language === 'en'
                      ? 'The real-time data and predictive analytics give us a competitive edge that\'s simply unmatched.'
                      : 'Los datos en tiempo real y el análisis predictivo nos dan una ventaja competitiva que simplemente no tiene igual.',
                    avatar: 'ER',
                    gradient: 'from-purple-500 to-pink-500'
                  },
                  {
                    name: 'David Kim',
                    role: language === 'en' ? 'Youth Coach, Bayern Munich' : 'Entrenador Juvenil, Bayern Munich',
                    quote: language === 'en'
                      ? 'Perfect for developing young talent. The player development insights are game-changing.'
                      : 'Perfecto para desarrollar talento joven. Los insights de desarrollo de jugadores cambian el juego.',
                    avatar: 'DK',
                    gradient: 'from-orange-500 to-red-500'
                  },
                  {
                    name: 'Lisa Thompson',
                    role: language === 'en' ? 'Assistant Coach, Chelsea FC' : 'Entrenadora Asistente, Chelsea FC',
                    quote: language === 'en'
                      ? 'The simplicity and power of Statsor makes it essential for modern football coaching.'
                      : 'La simplicidad y el poder de Statsor lo hace esencial para el entrenamiento de fútbol moderno.',
                    avatar: 'LT',
                    gradient: 'from-teal-500 to-green-500'
                  },
                  {
                    name: 'Roberto Silva',
                    role: language === 'en' ? 'Head of Analytics, PSG' : 'Jefe de Análisis, PSG',
                    quote: language === 'en'
                      ? 'Finally, a platform that understands what coaches actually need. Brilliant execution.'
                      : 'Finalmente, una plataforma que entiende lo que los entrenadores realmente necesitan. Ejecución brillante.',
                    avatar: 'RS',
                    gradient: 'from-indigo-500 to-purple-500'
                  }
                ].map((testimonial, index) => (
                  <motion.div
                    key={`${duplicateIndex}-${index}`}
                    className="group flex-shrink-0 w-96 p-8 rounded-2xl border transition-all duration-700 interactive-element relative overflow-hidden bg-gray-900/80 border-gray-700/50 hover:border-gray-500/70 hover:bg-gray-800/90 shadow-xl hover:shadow-2xl backdrop-blur-sm"
                    whileHover={{ 
                      y: -12, 
                      scale: 1.03,
                      rotateY: 3,
                      transition: { duration: 0.5, ease: "easeOut" }
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    {/* Animated background gradient */}
                    <motion.div
                      className={`absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity duration-700 bg-gradient-to-br ${testimonial.gradient} blur-3xl`}
                      initial={{ scale: 0.8, rotate: -5 }}
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {/* Subtle glow effect */}
                    <div className={`absolute inset-0 opacity-5 bg-gradient-to-t ${testimonial.gradient} rounded-2xl`} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center mb-6">
                        <motion.div 
                          className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 bg-gradient-to-r ${testimonial.gradient} shadow-lg`}
                          whileHover={{ 
                            rotate: 360,
                            scale: 1.1
                          }}
                          transition={{ duration: 0.6 }}
                        >
                          <span className="font-bold text-white text-lg">{testimonial.avatar}</span>
                        </motion.div>
                        <div>
                          <motion.h4 
                            className="font-semibold text-lg text-white"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {testimonial.name}
                          </motion.h4>
                          <motion.p 
                            className="text-sm text-gray-400"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            {testimonial.role}
                          </motion.p>
                        </div>
                      </div>
                      
                      <motion.p 
                        className="leading-relaxed text-lg mb-4 text-gray-300"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        "{testimonial.quote}"
                      </motion.p>
                      
                      <motion.div 
                        className="flex"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1, duration: 0.3 }}
                            whileHover={{ 
                              scale: 1.2,
                              rotate: 360,
                              transition: { duration: 0.3 }
                            }}
                          >
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                    
                    {/* Floating quote decoration */}
                    <motion.div
                      className={`absolute top-4 right-4 text-6xl opacity-10 ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                      }`}
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      "
                    </motion.div>
                  </motion.div>
                )))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Enhanced Final CTA Section - Cursor.com Style */}
        <motion.section 
          className="py-32 relative overflow-hidden"
          variants={itemVariants}
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1 h-1 rounded-full ${
                  theme === 'dark' ? 'bg-green-400' : 'bg-blue-400'
                } opacity-40`}
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + i * 8}%`,
                }}
                variants={backgroundParticles}
                animate="animate"
                transition={{
                  delay: i * 0.3,
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Central Gradient Orb */}
            <motion.div
              className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500' 
                  : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'
              }`}
              style={{
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <motion.div 
              variants={itemVariants}
            >
              {/* Text Reveal Animation for Headline */}
              <div className="overflow-hidden mb-8">
                <motion.h2 
                  className="text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-gray-200 bg-clip-text text-transparent"
                  variants={textRevealVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={0}
                >
                  {language === 'en' ? 'Try Statsor today' : 'Prueba Statsor hoy'}
                </motion.h2>
              </div>
              
              <motion.p 
                className={`text-xl md:text-2xl max-w-2xl mx-auto mb-12 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
                variants={textRevealVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={1}
              >
                {language === 'en'
                  ? 'Join thousands of coaches already using AI to make better decisions.'
                  : 'Únete a miles de entrenadores que ya usan IA para tomar mejores decisiones.'
                }
              </motion.p>
              
              {/* Magnetic Button Effects */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                variants={itemVariants}
              >
                <Link to="/signup">
                  <motion.div
                    variants={magneticVariants}
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="lg"
                      className={`px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 interactive-element relative overflow-hidden ${
                        theme === 'dark' 
                          ? 'bg-white text-black hover:bg-gray-100' 
                          : 'bg-black text-white hover:bg-gray-900'
                      }`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 opacity-0 hover:opacity-20 transition-opacity duration-300"
                        whileHover={{ opacity: 0.2 }}
                      />
                      <span className="relative z-10">
                        {language === 'en' ? 'Start free trial' : 'Comenzar prueba gratuita'}
                      </span>
                    </Button>
                  </motion.div>
                </Link>
                
                <motion.div
                  variants={magneticVariants}
                  whileHover="hover"
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="ghost"
                    size="lg"
                    onClick={() => setShowDemo(true)}
                    className={`px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 interactive-element group ${
                      theme === 'dark' 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-black hover:bg-gray-100'
                    }`}
                  >
                    {language === 'en' ? 'Book a demo' : 'Reservar demo'}
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>
              
              {/* Animated Trust Indicators */}
              <motion.div
                className="flex flex-wrap justify-center items-center gap-8 opacity-60"
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Shield className="h-5 w-5 text-green-500" />
                  </motion.div>
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'Secure & Private' : 'Seguro y Privado'}
                  </span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Users className="h-5 w-5 text-blue-500" />
                  </motion.div>
                  <span className="text-sm font-medium">
                    {language === 'en' ? '10,000+ Coaches' : '10,000+ Entrenadores'}
                  </span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </motion.div>
                  <span className="text-sm font-medium">
                    {language === 'en' ? 'AI-Powered' : 'Potenciado por IA'}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Humanized Helper Bot */}
        <HumanizedHelperBot />

        {/* Enhanced Footer */}
        <motion.footer 
          className="py-16 border-t transition-all duration-500 bg-gray-900/95 border-gray-700"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Target className="h-5 w-5 text-white" />
                   </motion.div>
                  <span className="text-xl font-bold">Statsor</span>
                </div>
                <p className="opacity-80">
                  {language === 'en'
                    ? 'Integral software for football coaches that revolutionizes team management'
                    : 'Software integral para entrenadores de fútbol que revoluciona la gestión de equipos'
                  }
                </p>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">{language === 'en' ? 'Product' : 'Producto'}</h4>
                <ul className="space-y-2 opacity-80">
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Link to="/" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'Home' : 'Inicio'}</Link>
                  </motion.li>
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <a href="#features" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'Features' : 'Funciones'}</a>
                  </motion.li>
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Link to="/pricing" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'Pricing' : 'Precios'}</Link>
                  </motion.li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">{language === 'en' ? 'Resources' : 'Recursos'}</h4>
                <ul className="space-y-2 opacity-80">
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <a href="#" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'Documentation' : 'Documentación'}</a>
                  </motion.li>
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <a href="#" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'API' : 'API'}</a>
                  </motion.li>
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <a href="#" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'Support' : 'Soporte'}</a>
                  </motion.li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">{language === 'en' ? 'Company' : 'Empresa'}</h4>
                <ul className="space-y-2 opacity-80">
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <a href="#" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'About Us' : 'Sobre Nosotros'}</a>
                  </motion.li>
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <a href="#" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'Contact' : 'Contacto'}</a>
                  </motion.li>
                  <motion.li whileHover={{ x: 5, scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <a href="#" className="hover:text-green-400 transition-all duration-300 hover:drop-shadow-sm">{language === 'en' ? 'Privacy' : 'Privacidad'}</a>
                  </motion.li>
                </ul>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-8 text-center opacity-60">
              <p>&copy; 2024 Statsor. {language === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}</p>
            </div>
          </div>
        </motion.footer>

        {/* Powerful Demo Modal */}
        <AnimatePresence>
          {showDemo && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDemo(false)}
              />
              
              {/* Modal Content */}
              <motion.div
                className="relative w-full max-w-6xl max-h-[90vh] rounded-2xl overflow-hidden bg-gray-900 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                        <Play className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {language === 'en' ? 'Statsor Demo' : 'Demo de Statsor'}
                        </h2>
                        <p className="text-sm opacity-70">
                          {language === 'en' ? 'See how Statsor transforms football coaching' : 'Ve cómo Statsor transforma el entrenamiento de fútbol'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDemo(false)}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Video Player */}
                <div className="relative bg-black">
                  <div className="aspect-video relative">
                    {/* Placeholder for video - you can replace with actual video */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-4 mx-auto">
                          <Play className="h-12 w-12 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {language === 'en' ? 'Interactive Demo Coming Soon' : 'Demo Interactiva Próximamente'}
                        </h3>
                        <p className="text-gray-400 max-w-md">
                          {language === 'en' 
                            ? 'Experience the full power of Statsor with our interactive demo. See real-time analytics, player tracking, and AI insights in action.'
                            : 'Experimenta todo el poder de Statsor con nuestra demo interactiva. Ve análisis en tiempo real, seguimiento de jugadores e insights de IA en acción.'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Video Controls */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="bg-black/50 hover:bg-black/70 text-white"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                          className="bg-black/50 hover:bg-black/70 text-white"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="bg-black/50 hover:bg-black/70 text-white"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Demo Features */}
                <div className="p-6 bg-gray-900">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="h-6 w-6 text-blue-500" />
                      </div>
                      <h4 className="font-semibold mb-2">
                        {language === 'en' ? 'Real-time Analytics' : 'Analíticas en Tiempo Real'}
                      </h4>
                      <p className="text-sm opacity-70">
                        {language === 'en' 
                          ? 'Live match statistics and performance insights'
                          : 'Estadísticas de partido en vivo e insights de rendimiento'
                        }
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-green-500" />
                      </div>
                      <h4 className="font-semibold mb-2">
                        {language === 'en' ? 'Player Tracking' : 'Seguimiento de Jugadores'}
                      </h4>
                      <p className="text-sm opacity-70">
                        {language === 'en' 
                          ? 'Individual performance monitoring and analysis'
                          : 'Monitoreo y análisis del rendimiento individual'
                        }
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-purple-500" />
                      </div>
                      <h4 className="font-semibold mb-2">
                        {language === 'en' ? 'AI Insights' : 'Insights de IA'}
                      </h4>
                      <p className="text-sm opacity-70">
                        {language === 'en' 
                          ? 'Smart tactical recommendations and predictions'
                          : 'Recomendaciones tácticas inteligentes y predicciones'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="flex justify-center space-x-4 mt-8">
                    <Button
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-white px-8"
                      onClick={() => setShowDemo(false)}
                    >
                      {language === 'en' ? 'Start Free Trial' : 'Comenzar Prueba Gratuita'}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-8"
                      onClick={() => setShowDemo(false)}
                    >
                      {language === 'en' ? 'Schedule Demo' : 'Programar Demo'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </AnimatePresence>
  );
};

export default Index;