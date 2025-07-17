
import React from 'react';
import { GraduationCap, Target, Users, Clock } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: GraduationCap,
      title: "Experienced Faculty",
      description: "Learn from industry experts with years of teaching experience and proven track records."
    },
    {
      icon: Target,
      title: "Result-Oriented Teaching",
      description: "Our structured approach and proven methodologies ensure maximum success rates."
    },
    {
      icon: Users,
      title: "Personal Mentorship",
      description: "Get individual attention and personalized guidance to overcome your weaknesses."
    },
    {
      icon: Clock,
      title: "Flexible Batches",
      description: "Choose from morning, evening, or weekend batches that fit your schedule perfectly."
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-coaching-blue">Doppler Coaching Centre</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide the perfect blend of expert teaching, personalized attention, and proven results
            to help you achieve your academic goals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-coaching-blue/20 hover:-translate-y-2"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-coaching-blue-light rounded-2xl flex items-center justify-center group-hover:bg-coaching-blue transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-coaching-blue group-hover:text-white transition-colors duration-300" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-coaching-blue transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
