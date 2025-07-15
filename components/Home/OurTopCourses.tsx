
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Star, ArrowRight, BookOpen } from 'lucide-react';

const TopCourses = () => {
  const courses = [
    {
      id: 1,
      name: "JEE Main & Advanced",
      duration: "2 Years",
      description: "Comprehensive coaching for JEE Main and Advanced with expert faculty and proven methodology.",
      students: "1200+",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      name: "NEET",
      duration: "2 Years",
      description: "Medical entrance exam preparation with experienced biology, chemistry, and physics teachers.",
      students: "800+",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      name: "Class 10 Board Prep",
      duration: "1 Year",
      description: "Complete preparation for Class 10 board exams with regular tests and doubt clearing sessions.",
      students: "600+",
      rating: "4.7",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      name: "Class 12 Board Prep",
      duration: "1 Year",
      description: "Intensive coaching for Class 12 boards with focus on concept clarity and exam strategy.",
      students: "700+",
      rating: "4.8",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      name: "Foundation Course",
      duration: "2 Years",
      description: "Strong foundation building for Class 8-9 students preparing for competitive exams.",
      students: "400+",
      rating: "4.9",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      name: "Competitive Exam Prep",
      duration: "1 Year",
      description: "Specialized coaching for various competitive exams with mock tests and performance analysis.",
      students: "300+",
      rating: "4.6",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section id="courses" className="py-20 lg:py-28   bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            Academic Excellence
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Our Premium Course
            <span className="block text-primary">Portfolio</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Discover our comprehensive range of courses designed by industry experts to help students achieve academic excellence and career success.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="group overflow-hidden hover:shadow-xl transition-all duration-500 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.name}
                  className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-semibold text-gray-900">{course.rating}</span>
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                  {course.name}
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed text-sm">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 pb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="p-1.5 bg-green-500/10 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <span className="font-medium">{course.students}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5"
                  size="lg"
                >
                  Explore Course
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6 text-lg">
            Can't find the right course? We offer customized programs too.
          </p>
          <Button variant="outline" size="lg" className="px-8 py-3 rounded-xl font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            View All Courses
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopCourses;
