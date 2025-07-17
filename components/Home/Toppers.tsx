
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Star, ArrowRight } from 'lucide-react';

const StudentResults = () => {
  const toppers = [
    {
      name: "Priya Sharma",
      course: "JEE Advanced",
      rank: "AIR 15",
      achievement: "IIT Delhi - Computer Science",
      image: "https://images.unsplash.com/photo-1494790108755-2616c1e0ec8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      score: "320/360"
    },
    {
      name: "Rahul Kumar",
      course: "NEET",
      rank: "AIR 42",
      achievement: "AIIMS Delhi - MBBS",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      score: "680/720"
    },
    {
      name: "Ananya Singh",
      course: "JEE Main",
      rank: "State Rank 3",
      achievement: "NIT Trichy - Electronics",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      score: "99.8 Percentile"
    },
    {
      name: "Vikash Patel",
      course: "Class 12th",
      rank: "School Topper",
      achievement: "98.2% - Science Stream",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      score: "491/500"
    }
  ];

  return (
    <section id="results" className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="w-8 h-8 text-coaching-blue" />
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
              Meet Our <span className="text-coaching-blue">Toppers</span>
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our students consistently achieve top ranks in competitive exams and board results. 
            Their success stories inspire and motivate future achievers.
          </p>
        </div>

        {/* Toppers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {toppers.map((topper, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2"
            >
              {/* Student Image */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-coaching-blue-light group-hover:ring-coaching-blue transition-all duration-300">
                  <img
                    src={topper.image}
                    alt={topper.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Rank Badge */}
                <div className="absolute -top-2 -right-2 bg-coaching-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  <Star className="w-4 h-4" />
                </div>
              </div>

              {/* Student Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {topper.name}
                </h3>
                
                <div className="mb-3">
                  <span className="bg-coaching-green-light text-coaching-green px-3 py-1 rounded-full text-sm font-semibold">
                    {topper.course}
                  </span>
                </div>

                <p className="text-coaching-blue font-bold text-lg mb-2">
                  {topper.rank}
                </p>

                <p className="text-gray-600 text-sm mb-3">
                  {topper.achievement}
                </p>

                <div className="bg-coaching-gray-light rounded-lg p-3">
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="font-bold text-coaching-blue">{topper.score}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-coaching-blue-light rounded-2xl p-8 mb-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-coaching-blue mb-2">95%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-coaching-blue mb-2">500+</div>
              <p className="text-gray-600">Top 100 Ranks</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-coaching-blue mb-2">50+</div>
              <p className="text-gray-600">IIT Selections</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-coaching-blue mb-2">80+</div>
              <p className="text-gray-600">Medical Seats</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-coaching-blue hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            See All Results
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StudentResults;
