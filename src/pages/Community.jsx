import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Community.css";

const Community = ({ user }) => {
  const [activeTab, setActiveTab] = useState("forum");
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Mock data for forum posts
  const [forumPosts, setForumPosts] = useState([
    {
      id: 1,
      title: "Just got my first US remote job!",
      content: "After 3 months of applying, I finally landed a remote position with a US tech company. The ITIN process was smoother than expected!",
      author: "Maria from Jamaica",
      country: "🇯🇲",
      category: "success-stories",
      likes: 42,
      comments: 12,
      time: "2 days ago",
      tags: ["Success", "ITIN", "Job Search"],
      isLiked: false
    },
    {
      id: 2,
      title: "Tax treaty benefits for Barbados",
      content: "Does anyone have experience claiming tax treaty benefits as a Barbadian working for US companies? Looking for advice on Form W-8BEN.",
      author: "David B.",
      country: "🇧🇧",
      category: "tax-questions",
      likes: 18,
      comments: 7,
      time: "1 week ago",
      tags: ["Tax", "Barbados", "W-8BEN"],
      isLiked: false
    },
    {
      id: 3,
      title: "Best payment methods for Trinidad",
      content: "What are the most cost-effective ways to receive payments from US clients if you're in Trinidad? Wise vs Payoneer vs local bank transfers.",
      author: "Sarah T.",
      country: "🇹🇹",
      category: "payment-discussion",
      likes: 31,
      comments: 15,
      time: "3 days ago",
      tags: ["Payments", "Trinidad", "Banking"],
      isLiked: true
    },
    {
      id: 4,
      title: "Time zone management tips",
      content: "How do you manage working on US time zones from the Caribbean? Share your productivity tips and schedule hacks!",
      author: "Alex from Bahamas",
      country: "🇧🇸",
      category: "work-life-balance",
      likes: 27,
      comments: 9,
      time: "5 days ago",
      tags: ["Productivity", "Time Management", "Remote Work"],
      isLiked: false
    }
  ]);

  // Mock data for blog articles
  const blogArticles = [
    {
      id: 1,
      title: "The Complete Guide to ITIN for Caribbean Freelancers",
      excerpt: "Step-by-step process for obtaining your ITIN and what to do after you get it.",
      author: "Tax Expert",
      readTime: "8 min read",
      category: "tax-guide",
      date: "Mar 15, 2024",
      featured: true
    },
    {
      id: 2,
      title: "Top 10 US Companies Hiring Caribbean Remote Workers in 2024",
      excerpt: "Discover which US companies are actively seeking talent from the Caribbean region.",
      author: "Career Advisor",
      readTime: "6 min read",
      category: "career-advice",
      date: "Mar 10, 2024",
      featured: true
    },
    {
      id: 3,
      title: "Navigating US Tax Treaties: A Caribbean Perspective",
      excerpt: "Understanding how tax treaties benefit Caribbean remote workers and how to claim them.",
      author: "Financial Consultant",
      readTime: "10 min read",
      category: "tax-guide",
      date: "Mar 5, 2024",
      featured: false
    },
    {
      id: 4,
      title: "Building a Strong Remote Work Portfolio",
      excerpt: "Tips for showcasing your skills to US employers even without local experience.",
      author: "Career Coach",
      readTime: "7 min read",
      category: "career-advice",
      date: "Feb 28, 2024",
      featured: false
    }
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: "Virtual Tax Workshop for Caribbean Remote Workers",
      date: "March 22, 2024",
      time: "6:00 PM EST",
      description: "Live Q&A with tax experts specializing in US-Caribbean remote work",
      speaker: "John Davis, CPA",
      spots: "45/100 spots left"
    },
    {
      id: 2,
      title: "ITIN Application Clinic",
      date: "March 29, 2024",
      time: "4:00 PM EST",
      description: "Step-by-step guidance and document review session",
      speaker: "Maria Rodriguez",
      spots: "22/50 spots left"
    },
    {
      id: 3,
      title: "Networking Mixer: Caribbean Tech Professionals",
      date: "April 5, 2024",
      time: "7:00 PM EST",
      description: "Connect with fellow Caribbean developers and designers",
      speaker: "Tech Community Leaders",
      spots: "78/100 spots left"
    }
  ];

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Topics" },
    { id: "success-stories", name: "Success Stories" },
    { id: "tax-questions", name: "Tax Questions" },
    { id: "payment-discussion", name: "Payment Discussions" },
    { id: "work-life-balance", name: "Work-Life Balance" },
    { id: "job-search", name: "Job Search Tips" },
    { id: "technical-help", name: "Technical Help" }
  ];

  // Filter posts by category
  const filteredPosts = selectedCategory === "all" 
    ? forumPosts 
    : forumPosts.filter(post => post.category === selectedCategory);

  // Handle new post submission
  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const newPostObj = {
      id: forumPosts.length + 1,
      title: newPost.substring(0, 50) + (newPost.length > 50 ? "..." : ""),
      content: newPost,
      author: user?.firstName || "Anonymous",
      country: "🇯🇲", // Default, could be based on user profile
      category: "general",
      likes: 0,
      comments: 0,
      time: "Just now",
      tags: ["New"],
      isLiked: false
    };

    setForumPosts([newPostObj, ...forumPosts]);
    setNewPost("");
    setShowNewPostForm(false);
    alert("Post submitted successfully!");
  };

  // Handle like/unlike
  const handleLike = (postId) => {
    setForumPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const wasLiked = post.isLiked;
        return {
          ...post,
          likes: wasLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !wasLiked
        };
      }
      return post;
    }));
  };

  // Handle comment
  const handleAddComment = (postId) => {
    if (!newComment.trim()) return;
    
    setForumPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1
        };
      }
      return post;
    }));
    
    setNewComment("");
    alert("Comment added!");
  };

  return (
    <div className="community-container">
      {/* NAVBAR */}
      <nav className="top-navbar">
        <div className="nav-left">
          <button 
            className="back-button"
            onClick={handleBack}
            aria-label="Go back"
            title="Go back"
          >
            ← Back
          </button>
          <div className="nav-brand">
            <span className="brand-logo">JobLytics</span>
          </div>
        </div>
        
        <div className="nav-center">
          <ul className="nav-links">
            <li><a href="/jobseeker">Dashboard</a></li>
            <li><a href="/job-search">Jobs</a></li>
            <li><a href="/job-seeker/applications">Applications</a></li>
            <li><a href="/schedule-interview">Interviews</a></li>
            <li><a href="/itin-support">ITIN Support</a></li>
            <li><a href="/payment-gateway">Payments</a></li>
            <li><a href="/tax-guidance">Tax Guide</a></li>
            <li><a href="/internet-speed-test">Internet Test</a></li>
            <li><a href="/community" className="active">Community</a></li>
          </ul>
        </div>

        <div className="nav-actions">
          <div className="icon-button-container">
            <button 
              className="icon-button profile-icon-btn"
              onClick={() => navigate("/jobseeker/profile")}
              aria-label="Profile"
              title="Profile"
            >
              <span className="icon-button-icon">👤</span>
            </button>
          </div>

          <div className="icon-button-container">
            <button 
              className="icon-button logout-icon-btn"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <span className="icon-button-icon">🚪</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="community-content-wrapper">
        {/* Hero Section */}
        <div className="community-hero">
          <h1>👥 Community Hub</h1>
          <p className="hero-subtitle">
            Connect, share experiences, and learn from fellow Caribbean remote workers
          </p>
          <div className="community-stats">
            <div className="stat">
              <span className="stat-number">{forumPosts.length}</span>
              <span className="stat-label">Active Discussions</span>
            </div>
            <div className="stat">
              <span className="stat-number">{forumPosts.reduce((sum, post) => sum + post.comments, 0)}</span>
              <span className="stat-label">Community Replies</span>
            </div>
            <div className="stat">
              <span className="stat-number">{blogArticles.length}</span>
              <span className="stat-label">Helpful Articles</span>
            </div>
            <div className="stat">
              <span className="stat-number">{upcomingEvents.length}</span>
              <span className="stat-label">Upcoming Events</span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="community-tabs">
          <button 
            className={`tab-btn ${activeTab === "forum" ? "active" : ""}`}
            onClick={() => setActiveTab("forum")}
          >
            💬 Community Forum
          </button>
          <button 
            className={`tab-btn ${activeTab === "blog" ? "active" : ""}`}
            onClick={() => setActiveTab("blog")}
          >
            📚 Blog & Articles
          </button>
          <button 
            className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            📅 Events & Workshops
          </button>
          <button 
            className={`tab-btn ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => setActiveTab("resources")}
          >
            🎓 Learning Resources
          </button>
        </div>

        {/* Forum Tab */}
        {activeTab === "forum" && (
          <div className="forum-content">
            {/* Create New Post */}
            <div className="create-post-card">
              <div className="create-post-header">
                <div className="user-avatar">
                  {user?.firstName?.charAt(0) || "U"}
                </div>
                <button 
                  className="create-post-btn"
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                >
                  Start a discussion...
                </button>
              </div>
              
              {showNewPostForm && (
                <form className="new-post-form" onSubmit={handleSubmitPost}>
                  <textarea
                    placeholder="What's on your mind? Share your experience, ask a question, or offer advice..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={4}
                    className="post-textarea"
                  />
                  <div className="post-form-actions">
                    <select 
                      className="category-select"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      value={selectedCategory}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="form-buttons">
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => setShowNewPostForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="submit-post-btn"
                        disabled={!newPost.trim()}
                      >
                        Post to Community
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Category Filter */}
            <div className="category-filter">
              <div className="filter-header">
                <h3>Filter by Topic</h3>
                <span className="post-count">{filteredPosts.length} discussions</span>
              </div>
              <div className="category-tags">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`category-tag ${selectedCategory === category.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Forum Posts */}
            <div className="forum-posts">
              {filteredPosts.map(post => (
                <div key={post.id} className="forum-post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">
                        <span className="country-flag">{post.country}</span>
                      </div>
                      <div className="author-info">
                        <span className="author-name">{post.author}</span>
                        <span className="post-time">{post.time}</span>
                      </div>
                    </div>
                    <div className="post-category">
                      <span className="category-badge">{categories.find(c => c.id === post.category)?.name}</span>
                    </div>
                  </div>
                  
                  <div className="post-content">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-text">{post.content}</p>
                    
                    <div className="post-tags">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="post-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="post-actions">
                    <button 
                      className={`action-btn like-btn ${post.isLiked ? "liked" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <span className="action-icon">👍</span>
                      <span className="action-count">{post.likes}</span>
                    </button>
                    
                    <button className="action-btn comment-btn">
                      <span className="action-icon">💬</span>
                      <span className="action-count">{post.comments} comments</span>
                    </button>
                    
                    <button className="action-btn share-btn">
                      <span className="action-icon">↗️</span>
                      <span>Share</span>
                    </button>
                  </div>
                  
                  {/* Comment Input */}
                  <div className="comment-section">
                    <div className="comment-input">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="comment-field"
                      />
                      <button 
                        className="comment-submit"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment.trim()}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blog Tab */}
        {activeTab === "blog" && (
          <div className="blog-content">
            {/* Featured Articles */}
            <div className="featured-articles">
              <h2 className="section-title">📖 Featured Articles</h2>
              <div className="featured-grid">
                {blogArticles
                  .filter(article => article.featured)
                  .map(article => (
                    <div key={article.id} className="featured-article-card">
                      <div className="article-badge">Featured</div>
                      <div className="article-content">
                        <span className="article-category">{article.category.replace("-", " ")}</span>
                        <h3 className="article-title">{article.title}</h3>
                        <p className="article-excerpt">{article.excerpt}</p>
                        <div className="article-meta">
                          <span className="article-author">By {article.author}</span>
                          <span className="article-date">{article.date}</span>
                          <span className="article-readtime">{article.readTime}</span>
                        </div>
                        <button className="read-article-btn">Read Article →</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* All Articles */}
            <div className="all-articles">
              <h2 className="section-title">📚 All Articles</h2>
              <div className="articles-grid">
                {blogArticles.map(article => (
                  <div key={article.id} className="article-card">
                    <div className="article-header">
                      <span className="article-category">{article.category.replace("-", " ")}</span>
                      <span className="article-readtime">{article.readTime}</span>
                    </div>
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">{article.excerpt}</p>
                    <div className="article-footer">
                      <span className="article-author">By {article.author}</span>
                      <span className="article-date">{article.date}</span>
                    </div>
                    <button className="read-more-btn">Read More →</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Article Categories */}
            <div className="article-categories">
              <h2 className="section-title">🏷️ Browse by Category</h2>
              <div className="categories-grid">
                <div className="category-card tax-guide">
                  <h3>Tax Guides</h3>
                  <p>Understanding US taxes for Caribbean workers</p>
                  <span className="article-count">
                    {blogArticles.filter(a => a.category === "tax-guide").length} articles
                  </span>
                </div>
                <div className="category-card career-advice">
                  <h3>Career Advice</h3>
                  <p>Job search tips and career development</p>
                  <span className="article-count">
                    {blogArticles.filter(a => a.category === "career-advice").length} articles
                  </span>
                </div>
                <div className="category-card success-stories">
                  <h3>Success Stories</h3>
                  <p>Real experiences from Caribbean remote workers</p>
                  <span className="article-count">Coming soon</span>
                </div>
                <div className="category-card technical-guides">
                  <h3>Technical Guides</h3>
                  <p>Tools and tech for remote work</p>
                  <span className="article-count">Coming soon</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="events-content">
            {/* Upcoming Events */}
            <div className="upcoming-events">
              <h2 className="section-title">📅 Upcoming Events & Workshops</h2>
              <div className="events-grid">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-date">
                      <span className="event-month">{event.date.split(" ")[0]}</span>
                      <span className="event-day">{event.date.split(" ")[1].replace(",", "")}</span>
                    </div>
                    <div className="event-content">
                      <h3 className="event-title">{event.title}</h3>
                      <p className="event-description">{event.description}</p>
                      <div className="event-details">
                        <span className="event-time">🕒 {event.time}</span>
                        <span className="event-speaker">👨‍🏫 {event.speaker}</span>
                      </div>
                      <div className="event-spots">
                        <span className="spots-remaining">{event.spots}</span>
                        <button className="register-btn">Register Now</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Calendar */}
            <div className="event-calendar">
              <h2 className="section-title">🗓️ Community Calendar</h2>
              <div className="calendar-view">
                <div className="calendar-header">
                  <h3>March 2024</h3>
                  <div className="calendar-nav">
                    <button className="nav-btn">←</button>
                    <button className="nav-btn">Today</button>
                    <button className="nav-btn">→</button>
                  </div>
                </div>
                <div className="calendar-grid">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="calendar-day-header">{day}</div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <div 
                      key={day} 
                      className={`calendar-day ${day === 22 || day === 29 || day === 5 ? "has-event" : ""}`}
                    >
                      <span className="day-number">{day}</span>
                      {day === 22 && <span className="event-indicator">Tax Workshop</span>}
                      {day === 29 && <span className="event-indicator">ITIN Clinic</span>}
                      {day === 5 && <span className="event-indicator">Networking</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Past Events */}
            <div className="past-events">
              <h2 className="section-title">🎥 Past Event Recordings</h2>
              <div className="recordings-grid">
                <div className="recording-card">
                  <div className="recording-thumbnail">
                    <span className="play-icon">▶️</span>
                  </div>
                  <div className="recording-info">
                    <h3>February Tax Q&A Session</h3>
                    <p>Recording available for community members</p>
                    <button className="watch-btn">Watch Recording</button>
                  </div>
                </div>
                <div className="recording-card">
                  <div className="recording-thumbnail">
                    <span className="play-icon">▶️</span>
                  </div>
                  <div className="recording-info">
                    <h3>January Career Workshop</h3>
                    <p>Tips for acing US remote job interviews</p>
                    <button className="watch-btn">Watch Recording</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="resources-content">
            {/* Downloadable Resources */}
            <div className="downloadable-resources">
              <h2 className="section-title">📥 Downloadable Resources</h2>
              <div className="resources-grid">
                <div className="resource-card">
                  <div className="resource-icon">📋</div>
                  <div className="resource-info">
                    <h3>ITIN Application Checklist</h3>
                    <p>Complete checklist for ITIN application process</p>
                    <button className="download-btn">Download PDF</button>
                  </div>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">💼</div>
                  <div className="resource-info">
                    <h3>Remote Work Contract Template</h3>
                    <p>Sample contract for US remote work agreements</p>
                    <button className="download-btn">Download DOC</button>
                  </div>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">💰</div>
                  <div className="resource-info">
                    <h3>Tax Deductions Guide</h3>
                    <p>Common tax deductions for remote workers</p>
                    <button className="download-btn">Download PDF</button>
                  </div>
                </div>
                <div className="resource-card">
                  <div className="resource-icon">📊</div>
                  <div className="resource-info">
                    <h3>Income Tracker Template</h3>
                    <p>Spreadsheet to track US income and taxes</p>
                    <button className="download-btn">Download XLS</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpful Links */}
            <div className="helpful-links">
              <h2 className="section-title">🔗 Helpful Links & Tools</h2>
              <div className="links-grid">
                <a href="https://www.irs.gov" target="_blank" rel="noopener noreferrer" className="link-card">
                  <h3>IRS Official Website</h3>
                  <p>US tax forms and information</p>
                  <span className="link-arrow">↗</span>
                </a>
                <a href="https://wise.com" target="_blank" rel="noopener noreferrer" className="link-card">
                  <h3>Wise Transfer Calculator</h3>
                  <p>Compare international transfer rates</p>
                  <span className="link-arrow">↗</span>
                </a>
                <a href="https://timeanddate.com/worldclock" target="_blank" rel="noopener noreferrer" className="link-card">
                  <h3>Time Zone Converter</h3>
                  <p>Convert between Caribbean and US time zones</p>
                  <span className="link-arrow">↗</span>
                </a>
                <a href="https://currencyconverter.com" target="_blank" rel="noopener noreferrer" className="link-card">
                  <h3>Currency Converter</h3>
                  <p>Convert USD to Caribbean currencies</p>
                  <span className="link-arrow">↗</span>
                </a>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="community-guidelines">
              <h2 className="section-title">🤝 Community Guidelines</h2>
              <div className="guidelines-card">
                <div className="guideline">
                  <span className="guideline-icon">👍</span>
                  <div className="guideline-content">
                    <h4>Be Respectful</h4>
                    <p>Treat all community members with respect and kindness.</p>
                  </div>
                </div>
                <div className="guideline">
                  <span className="guideline-icon">🔒</span>
                  <div className="guideline-content">
                    <h4>Protect Privacy</h4>
                    <p>Never share personal information of yourself or others.</p>
                  </div>
                </div>
                <div className="guideline">
                  <span className="guideline-icon">💡</span>
                  <div className="guideline-content">
                    <h4>Share Knowledge</h4>
                    <p>Help others by sharing your experiences and knowledge.</p>
                  </div>
                </div>
                <div className="guideline">
                  <span className="guideline-icon">🚫</span>
                  <div className="guideline-content">
                    <h4>No Spam</h4>
                    <p>Keep discussions relevant to Caribbean remote work.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;