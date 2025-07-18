'use client';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const testimonials = [
    {
      name: "Meera Gupta",
      course: "JEE Advanced Preparation",
      result: "AIR 28",
      institution: "IIT Bombay",
      image: "https://images.unsplash.com/photo-1494790108755-2616c1e0ec8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      quote: "The structured approach and personalized mentoring transformed my preparation completely. The faculty's deep understanding of concepts and their ability to simplify complex problems gave me the confidence to excel in one of India's toughest examinations."
    },
    {
      name: "Arjun Reddy",
      course: "NEET Preparation",
      result: "AIR 156",
      institution: "AIIMS Delhi",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      quote: "The comprehensive study material and regular assessment tests were instrumental in my success. The teachers' constant support and innovative teaching methods helped me stay motivated throughout my preparation journey."
    },
    {
      name: "Kavya Sharma",
      course: "Class 12th Science",
      result: "97.8%",
      institution: "CBSE Board",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      quote: "Beyond excellent academic results, I gained critical thinking skills and a systematic approach to learning. The foundation built here has been invaluable for my higher education pursuits and personal growth."
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentTestimonial];

  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-inter">
            Success Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real achievements from students who transformed their academic journey with us
          </p>
        </div>

        {/* Testimonial Card */}
        <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Side - Student Info */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto lg:mx-0 rounded-full overflow-hidden ring-4 ring-gray-100">
                    <img
                      src={current.image}
                      alt={current.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="text-center lg:text-left space-y-3">
                  <h3 className="text-2xl font-bold text-gray-900 font-inter">
                    {current.name}
                  </h3>
                  
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-blue-600">
                      {current.result}
                    </p>
                    <p className="text-lg text-gray-700 font-medium">
                      {current.institution}
                    </p>
                    <p className="text-gray-600">
                      {current.course}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Quote */}
              <div className="space-y-6">
                <blockquote className="text-xl lg:text-2xl text-gray-800 leading-relaxed font-serif italic">
                  "{current.quote}"
                </blockquote>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
              
              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={prevTestimonial}
                  className="p-3 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white transition-all duration-200 group"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button
                  onClick={nextTestimonial}
                  className="p-3 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white transition-all duration-200 group"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentTestimonial === index 
                        ? 'bg-blue-600 scale-110' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        
        
      </div>
    </section>
  );
};

export default Testimonials;
