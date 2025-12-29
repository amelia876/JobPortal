import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Sample job titles database
  const jobTitles = [
    "Software Engineer", "Software Developer", "Frontend Developer", "Backend Developer", 
    "Full Stack Developer", "Web Developer", "Mobile Developer", "DevOps Engineer", 
    "Data Scientist", "Data Analyst", "Machine Learning Engineer", "Product Manager", 
    "Project Manager", "UI/UX Designer", "Graphic Designer", "Digital Marketing Specialist", 
    "Content Writer", "Sales Representative", "Customer Service Representative", 
    "Business Analyst", "Financial Analyst", "HR Manager", "Recruiter", "Operations Manager", 
    "Accountant", "Social Media Manager", "SEO Specialist", "Network Administrator", 
    "System Administrator", "Quality Assurance Tester", "Technical Support", "IT Consultant", 
    "Database Administrator", "Cloud Architect", "Security Analyst", "Product Designer", 
    "UX Researcher", "Content Strategist", "Digital Designer", "Video Editor", "Photographer", 
    "Teacher", "Professor", "Research Assistant", "Laboratory Technician", "Registered Nurse", 
    "Doctor", "Dentist", "Pharmacist", "Physical Therapist", "Electrician", "Plumber", 
    "Construction Worker", "Architect", "Civil Engineer", "Mechanical Engineer", 
    "Electrical Engineer", "Chemical Engineer", "Marketing Manager", "Sales Manager", 
    "Business Development Manager", "Chief Executive Officer", "Chief Technology Officer", 
    "Chief Marketing Officer", "Legal Assistant", "Lawyer", "Paralegal", "Real Estate Agent", 
    "Insurance Agent", "Financial Advisor", "Investment Banker", "Stock Broker", 
    "Hotel Manager", "Chef", "Waiter", "Bartender", "Travel Agent", "Pilot", "Flight Attendant", 
    "Police Officer", "Firefighter", "Security Guard", "Delivery Driver", "Truck Driver", 
    "Warehouse Worker", "Factory Worker", "Farm Worker", "Gardener", "Veterinarian", 
    "Animal Caretaker"
  ];

  const categories = [
    "Business Development", "Construction", "Customer Service", 
    "Finance", "Healthcare", "Human Resources", 
    "Education", "Design", "Marketing", "Technology"
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechInnovate",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&w=100&h=100&fit=crop&crop=face",
      text: "JobLytics helped me transition from marketing to product management. The personalized job matches and career insights were invaluable in my career change journey.",
      rating: 5,
      previousRole: "Marketing Specialist"
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Senior Developer",
      company: "CloudScale Inc",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=100&h=100&fit=crop&crop=face",
      text: "Found my dream remote job in 2 weeks! The analytics showed me exactly what skills were in demand and helped me tailor my applications.",
      rating: 5,
      previousRole: "Full Stack Developer"
    },
    {
      id: 3,
      name: "Jessica Williams",
      role: "Data Scientist",
      company: "DataDriven Corp",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=100&h=100&fit=crop&crop=face",
      text: "The salary insights and company analytics helped me negotiate a 30% higher offer. JobLytics is more than just a job board - it's a career companion.",
      rating: 5,
      previousRole: "Data Analyst"
    },
    {
      id: 4,
      name: "David Kim",
      role: "UX Lead",
      company: "DesignStudio Pro",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=100&h=100&fit=crop&crop=face",
      text: "As a designer, I appreciated the visual approach to job searching. The platform's insights helped me understand market trends and position myself better.",
      rating: 4,
      previousRole: "UI Designer"
    },
    {
      id: 5,
      name: "Emily Thompson",
      role: "Marketing Director",
      company: "GrowthMarketing Co",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&w=100&h=100&fit=crop&crop=face",
      text: "From entry-level to director in 4 years! JobLytics' career path projections helped me plan my growth and identify the right opportunities.",
      rating: 5,
      previousRole: "Marketing Coordinator"
    },
    {
      id: 6,
      name: "Alex Johnson",
      role: "DevOps Engineer",
      company: "SecureSystems Ltd",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=100&h=100&fit=crop&crop=face",
      text: "The skill gap analysis feature showed me exactly what certifications I needed. Landed a 40% higher paying role with better work-life balance.",
      rating: 5,
      previousRole: "System Administrator"
    }
  ];

  const successStories = [
    {
      name: "Maria Gonzalez",
      from: "Customer Service",
      to: "Product Manager",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=80&h=80&fit=crop&crop=face",
      text: "Used JobLytics analytics to identify needed skills and landed a 50% salary increase",
      stats: ["⏱️ 3 weeks to hire", "💰 50% salary increase"]
    },
    {
      name: "James Wilson",
      from: "Local Company",
      to: "Global Tech Remote",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&w=80&h=80&fit=crop&crop=face",
      text: "The remote job filter and company matching helped me find the perfect flexible role",
      stats: ["🏠 Fully remote", "⚡ 2 week process"]
    }
  ];

  const resources = [
    {
      title: "5 Resume Tips That Get You Noticed",
      description: "Learn how to optimize your resume for AI screening systems",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      link: "#"
    },
    {
      title: "Ace Your Technical Interview",
      description: "Preparation strategies for technical roles in 2024",
      image: "https://images.unsplash.com/photo-1551836026-d5c2c0c65c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      link: "#"
    },
    {
      title: "Salary Negotiation Guide",
      description: "How to negotiate your offer with confidence",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      link: "#"
    }
  ];

  const faqs = [
    {
      question: "How does JobLytics differ from other job boards?",
      answer: "We use advanced AI and analytics to provide personalized job matches, salary insights, and career path projections, not just job listings."
    },
    {
      question: "Is JobLytics free to use?",
      answer: "Yes! Basic job searching and applications are completely free. Premium features like advanced analytics and personalized coaching are available in our paid plans."
    },
    {
      question: "How accurate are the salary estimates?",
      answer: "Our salary data is updated in real-time from thousands of sources and has 95% accuracy based on user verification."
    },
    {
      question: "Can employers see my profile?",
      answer: "Only if you choose to make your profile visible to employers. You have full control over your privacy settings."
    }
  ];

  // Debounce function for search performance
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Filter suggestions based on input
  const getSuggestions = useCallback((value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 
      ? [] 
      : jobTitles.filter(title =>
          title.toLowerCase().includes(inputValue)
        );
  }, [jobTitles]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value.length > 1) {
        const newSuggestions = getSuggestions(value);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    }, 300),
    [getSuggestions]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Redirect to login page with job title as parameter
    navigate('/login', { 
      state: { 
        preselectedJob: suggestion
      } 
    });
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      // Redirect directly to login page with search parameter
      navigate('/login', { 
        state: { 
          preselectedJob: searchTerm
        } 
      });
    } else {
      // If no search term, just redirect to login
      navigate('/login');
    }
  };

  // Handle category search
  const handleCategorySearch = (category) => {
    navigate('/login', { 
      state: { 
        preselectedCategory: category
      } 
    });
  };

  // Handle popular search tag clicks
  const handlePopularSearch = (term) => {
    setSearchTerm(term);
    
    // Redirect to login page
    navigate('/login', { 
      state: { 
        preselectedJob: term
      } 
    });
  };

  // Analytics tracking functions
  const trackSearchEvent = (term) => {
    console.log('Search Event:', { term });
    // Integrate with your analytics service here
  };

  const trackCategoryEvent = (category) => {
    console.log('Category Click:', category);
    // Integrate with your analytics service here
  };

  const trackPopularSearchEvent = (term) => {
    console.log('Popular Search Click:', term);
    // Integrate with your analytics service here
  };

  // Handle image errors
  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SEO and initial loading
  useEffect(() => {
    // Set page title and meta description
    document.title = "JobLytics - Find Your Dream Career with AI-Powered Job Matching";
    
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  // Error Boundary fallback UI
  if (false) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>Please refresh the page or try again later.</p>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="loading-skeleton">
          <div className="skeleton-navbar"></div>
          <div className="skeleton-hero"></div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">JobLytics</div>
        <ul className="nav-links">
          <li><a href="/Home">Home</a></li>
          <li><a href="/jobs">Jobs</a></li>
          <li><a href="/AboutUs">About</a></li>
          <li><a href="/Contact">Contact</a></li>
        </ul>
        <div className="nav-actions">
          <a href="/login" className="login-btn">Login</a>
          <a href="/signup" className="signup-btn">Sign Up</a>
        </div>
      </nav>















      

{/* HERO SECTION */}
{/* HERO SECTION */}
{/* HERO SECTION - SIDE BY SIDE LAYOUT */}
<section className="hero">
  <div className="hero-container">
    {/* LEFT COLUMN - Text & Search */}
    <div className="hero-left">
      <div className="hero-text">
        <h1>
          <span className="hero-title-main">Find Your Dream Career</span>
          <span className="hero-title-accent">with JobLytics</span>
        </h1>
        <p className="hero-subtitle">Discover your perfect opportunity through <span className="highlight">12,800+</span> curated job listings</p>
        
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-number">12.8k+</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat">
            <div className="stat-number">2.4k+</div>
            <div className="stat-label">Companies</div>
          </div>
          <div className="stat">
            <div className="stat-number">45k+</div>
            <div className="stat-label">Hired</div>
          </div>
        </div>
      </div>

      {/* SEARCH CONTAINER */}
      <form onSubmit={handleSearch} className="search-container">
        <div className="search-input-wrapper" ref={searchRef}>
          <div className="search-input-group">
            <div className="search-icon-wrapper">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M19 19L13.8033 13.8033M13.8033 13.8033C15.1605 12.4461 16 10.5711 16 8.5C16 4.35786 12.6421 1 8.5 1C4.35786 1 1 4.35786 1 8.5C1 12.6421 4.35786 16 8.5 16C10.5711 16 12.4461 15.1605 13.8033 13.8033Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="Job title, keywords, or company..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                aria-label="Job title or keyword"
              />
            </div>
            <button type="submit" className="search-btn">
              <span className="btn-text">Search</span>
              <svg className="btn-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M15.7071 8.70711C16.0976 8.31658 16.0976 7.68342 15.7071 7.29289L9.34315 0.928932C8.95262 0.538408 8.31946 0.538408 7.92893 0.928932C7.53841 1.31946 7.53841 1.95262 7.92893 2.34315L13.5858 8L7.92893 13.6569C7.53841 14.0474 7.53841 14.6805 7.92893 15.0711C8.31946 15.4616 8.95262 15.4616 9.34315 15.0711L15.7071 8.70711ZM0 9H15V7H0V9Z" fill="white"/>
              </svg>
            </button>
          </div>
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSuggestionClick(suggestion);
                  }}
                >
                  <span className="suggestion-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M15 15L11.6224 11.6224M11.6224 11.6224C12.7728 10.472 13.5 8.8284 13.5 7C13.5 5.1716 12.7728 3.528 11.6224 2.37756C10.472 1.22712 8.8284 0.5 7 0.5C5.1716 0.5 3.528 1.22712 2.37756 2.37756C1.22712 3.528 0.5 5.1716 0.5 7C0.5 8.8284 1.22712 10.472 2.37756 11.6224C3.528 12.7728 5.1716 13.5 7 13.5C8.8284 13.5 10.472 12.7728 11.6224 11.6224Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      <div className="popular-searches">
        <div className="popular-label">Trending Searches:</div>
        <div className="popular-tags">
          {["Software Engineer", "Data Analyst", "Product Manager", "Marketing", "Sales", "Remote"].map((term) => (
            <button 
              key={term} 
              type="button"
              onClick={() => handlePopularSearch(term)}
              className="popular-tag"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* RIGHT COLUMN - Photo Stack */}
    <div className="hero-right">
      <div className="photo-stack">
        <div className="stacked-photo main-photo">
          <img 
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
            alt="Team collaboration in modern office" 
            loading="eager"
          />
        </div>
        <div className="stacked-photo secondary-photo">
          <img 
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80" 
            alt="Professional working on laptop" 
            loading="lazy"
          />
        </div>
        <div className="stacked-photo tertiary-photo">
          <img 
            src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350&q=80" 
            alt="Business meeting" 
            loading="lazy"
          />
        </div>
        
        {/* Optional floating element */}
        <div className="floating-badge">
          <div className="badge-content">
            <span className="badge-icon">🔥</span>
            <span className="badge-text">45,000+ Hired</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
{/*END OF THE HERO SECTION*/}

     {/*END OF THE HERO SECTION*/}










  
{/* TOP COMPANIES WITH SVG ICONS */}
<section className="top-companies">
  <h2>Trusted by Leading Companies</h2>
  <p className="section-subtitle">Join thousands of professionals at top organizations</p>
  <div className="companies-grid">
    {[
      { name: 'Google', color: '#4285F4' },
      { name: 'Microsoft', color: '#737373' },
      { name: 'Amazon', color: '#FF9900' },
      { name: 'Netflix', color: '#E50914' },
      { name: 'Spotify', color: '#1DB954' },
      { name: 'Airbnb', color: '#FF5A5F' },
      { name: 'Uber', color: '#000000' },
      { name: 'Slack', color: '#4A154B' }
    ].map((company) => (
      <div key={company.name} className="company-logo">
        <span 
          className="company-name"
          style={{ color: company.color }}
        >
          {company.name}
        </span>
      </div>
    ))}
  </div>
</section>




      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2>How JobLytics Works</h2>
        <p className="section-subtitle">Your path to the perfect job in 3 simple steps</p>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Profile</h3>
            <p>Build your professional profile with skills, experience, and career preferences</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Get Smart Matches</h3>
            <p>Our AI analyzes your profile and matches you with ideal job opportunities</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Apply & Track</h3>
            <p>Apply with one click and track your applications in real-time</p>
          </div>
        </div>
      </section>

      {/* AI FEATURES */}
      <section className="ai-features">
        <div className="ai-content">
          <h2>Powered by Advanced AI</h2>
          <p>Smart features that give you the competitive edge</p>
          <div className="features-list">
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <div>
                <h4>Smart Job Matching</h4>
                <p>AI-powered recommendations based on your skills and preferences</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📈</div>
              <div>
                <h4>Salary Insights</h4>
                <p>Real-time market data to help you negotiate better offers</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">🔍</div>
              <div>
                <h4>Skill Gap Analysis</h4>
                <p>Identify skills you need to land your dream job</p>
              </div>
            </div>
            <div className="feature">
              <div className="feature-icon">📊</div>
              <div>
                <h4>Career Path Projection</h4>
                <p>See where your career could go with different choices</p>
              </div>
            </div>
          </div>
        </div>
        <div className="ai-visual">
          <img 
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400" 
            alt="AI Analytics Dashboard" 
            loading="lazy"
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories">
        <h2>Explore by Category</h2>
        <p className="section-subtitle">Browse jobs in your field of interest</p>
        <div className="category-grid">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="category-card"
              onClick={() => handleCategorySearch(category)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCategorySearch(category);
              }}
            >
              {category}
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="testimonials-header">
          <h2>Success Stories</h2>
          <p className="section-subtitle">Hear from professionals who found their dream jobs through JobLytics</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-content">
                <div className="stars">{renderStars(testimonial.rating)}</div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <img 
                    src={imageErrors[testimonial.id] ? '/default-avatar.png' : testimonial.image}
                    alt={testimonial.name}
                    className="author-avatar"
                    onError={() => handleImageError(testimonial.id)}
                    loading="lazy"
                  />
                  <div className="author-info">
                    <h4 className="author-name">{testimonial.name}</h4>
                    <p className="author-role">{testimonial.role}</p>
                    <p className="author-company">{testimonial.company}</p>
                    <div className="career-progress">
                      <span className="previous-role">Previously: {testimonial.previousRole}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="testimonials-stats">
          <div className="stat-item">
            <h3>12,800+</h3>
            <p>Jobs Found</p>
          </div>
          <div className="stat-item">
            <h3>4.8/5</h3>
            <p>User Rating</p>
          </div>
          <div className="stat-item">
            <h3>94%</h3>
            <p>Success Rate</p>
          </div>
          <div className="stat-item">
            <h3>2.3x</h3>
            <p>Faster Hiring</p>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="success-stories">
        <h2>Recent Success Stories</h2>
        <p className="section-subtitle">Real people, real results</p>
        <div className="stories-grid">
          {successStories.map((story, index) => (
            <div key={index} className="story-card">
              <div className="story-header">
                <img 
                  src={story.image} 
                  alt={story.name} 
                  loading="lazy"
                />
                <div>
                  <h4>{story.name} transformed her career</h4>
                  <p>From {story.from} to {story.to}</p>
                </div>
              </div>
              <p className="story-text">"{story.text}"</p>
              <div className="story-stats">
                {story.stats.map((stat, i) => (
                  <span key={i}>{stat}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RESOURCES */}
      <section className="resources">
        <h2>Career Resources</h2>
        <p className="section-subtitle">Expert advice to advance your career</p>
        <div className="resources-grid">
          {resources.map((resource, index) => (
            <div key={index} className="resource-card">
              <img 
                src={resource.image} 
                alt={resource.title} 
                loading="lazy"
              />
              <div className="resource-content">
                <h4>{resource.title}</h4>
                <p>{resource.description}</p>
                <a href={resource.link} className="read-more">Read More →</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MOBILE APP */}
      <section className="mobile-app">
        <div className="app-content">
          <h2>Job Search On The Go</h2>
          <p>Get instant job alerts and apply anywhere with our mobile app</p>
          <div className="app-features">
            <div className="app-feature">
              <span>📱</span>
              <span>Push Notifications for New Matches</span>
            </div>
            <div className="app-feature">
              <span>⚡</span>
              <span>One-Tap Applications</span>
            </div>
            <div className="app-feature">
              <span>💬</span>
              <span>Direct Messaging with Recruiters</span>
            </div>
          </div>
          <div className="app-download">
            <button className="app-store-btn">Download on App Store</button>
            <button className="play-store-btn">Get on Google Play</button>
          </div>
        </div>
        <div className="app-preview">
          <img 
            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=500" 
            alt="Mobile app preview" 
            loading="lazy"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Write Your Success Story?</h2>
          <p>Join thousands of professionals who found their dream job through JobLytics</p>
          <div className="cta-buttons">
            <a href="/signup" className="cta-primary">Get Started Free</a>
            <a href="/about" className="cta-secondary">Learn More</a>
          </div>
        </div>
      </section>

      {/* Screen reader only elements for accessibility */}
      <div className="sr-only">
        <h1>JobLytics - AI-Powered Job Search Platform</h1>
        <p>Find your dream job with intelligent matching, salary insights, and career growth tools.</p>
      </div>
    </div>
  );
};

export default Home;