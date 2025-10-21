import React, { useState } from 'react';
import './ScheduleInterviewPage.css';

const ScheduleInterviewPage = () => {
  const [meetingType, setMeetingType] = useState('in-person');
  const [selectedTime, setSelectedTime] = useState(null);

  const meetings = [
    {
      id: 1,
      title: 'Product marketing meeting',
      time: '11:00 AM - 11:45 AM',
      person: 'Joint Cooper'
    },
    {
      id: 2,
      title: 'User research discussion',
      time: '12:30 PM - 1:00 PM',
      person: 'Directi Showed'
    },
    {
      id: 3,
      title: 'Design review session',
      time: '2:59 PM - 3:00 PM',
      person: 'Robert Fox'
    }
  ];

  const recentMeetings = [
    {
      id: 1,
      title: 'SmartSync feature launch',
      date: 'Mon, April 28, 2024',
      duration: '4dm',
      description: 'The team convened for a focused discussion on the upcoming launch of the SmartSync feature, a pivotal update designed to enhance real-time...'
    },
    {
      id: 2,
      title: 'Weekly dev sync',
      date: 'Mon, April 28, 2024',
      duration: '8dm',
      description: 'The team discussed project progress, highlighting near-completion of backend and frontend development. They addressed citation...'
    }
  ];

  return (
    <div className="interview-page">
      {/* Navbar */}
      <nav className="interview-navbar">
        <div className="interview-navbar-content">
          <div className="interview-navbar-left">
            <h1 className="interview-logo">meetmind.ai</h1>
          </div>
          <div className="interview-navbar-center">
            <div className="interview-nav-links">
              <a href="#" className="interview-nav-link interview-nav-link-active">Home</a>
              <a href="#" className="interview-nav-link">Meetings</a>
              <a href="#" className="interview-nav-link">Schedule</a>
              <a href="#" className="interview-nav-link">History</a>
              <a href="#" className="interview-nav-link">Settings</a>
            </div>
          </div>
          <div className="interview-navbar-right">
            <div className="interview-user-menu">
              <div className="interview-user-avatar">
                <span>JD</span>
              </div>
              <span className="interview-user-name">John Doe</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="interview-container">
        {/* Left Section */}
        <div className="interview-left-section">
          <div className="interview-card">
            <h2>New meeting</h2>
            
            {/* Meeting Type Selection */}
            <div className="interview-meeting-type">
              <label className="interview-checkbox-label">
                <input 
                  type="radio" 
                  name="meetingType" 
                  checked={meetingType === 'online'}
                  onChange={() => setMeetingType('online')}
                />
                <span className="interview-checkmark"></span>
                Online meeting
              </label>
              <label className="interview-checkbox-label">
                <input 
                  type="radio" 
                  name="meetingType" 
                  checked={meetingType === 'in-person'}
                  onChange={() => setMeetingType('in-person')}
                />
                <span className="interview-checkmark"></span>
                In-person meeting
              </label>
              <label className="interview-checkbox-label">
                <input 
                  type="radio" 
                  name="meetingType" 
                  checked={meetingType === 'upload'}
                  onChange={() => setMeetingType('upload')}
                />
                <span className="interview-checkmark"></span>
                Upload meeting
              </label>
            </div>

            <div className="interview-divider"></div>

            {/* Meeting Details */}
            <div className="interview-meeting-details">
              <h3>Name your meeting (optional)</h3>
              <div className="interview-input-group">
                <input 
                  type="text" 
                  placeholder="E.g. Team Sync"
                  className="interview-text-input"
                />
              </div>
              
              <div className="interview-settings-group">
                <label className="interview-checkbox-label">
                  <input type="checkbox" />
                  <span className="interview-checkmark"></span>
                  English
                </label>
                <label className="interview-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span className="interview-checkmark"></span>
                  Notting language
                </label>
                <label className="interview-checkbox-label">
                  <input type="checkbox" />
                  <span className="interview-checkmark"></span>
                  Bot name
                </label>
                <input 
                  type="text" 
                  placeholder="Meetmind Bot"
                  className="interview-text-input"
                />
              </div>
            </div>

            {/* Search */}
            <div className="interview-search-section">
              <h3>Search Leo</h3>
              <div className="interview-search-input">
                <input 
                  type="text" 
                  placeholder="example@udeckubo.com"
                />
              </div>
            </div>

            {/* Top Time Slot */}
            <div className="interview-top-time-slot">
              <h3>Top 1: Open up at 10:00 PM</h3>
            </div>

            {/* Meetings List */}
            <div className="interview-meetings-list">
              <h3>Meetings</h3>
              {meetings.map(meeting => (
                <div 
                  key={meeting.id} 
                  className={`interview-meeting-item ${selectedTime === meeting.id ? 'interview-selected' : ''}`}
                  onClick={() => setSelectedTime(meeting.id)}
                >
                  <div className="interview-meeting-title">{meeting.title}</div>
                  <div className="interview-meeting-details-row">
                    <span className="interview-meeting-time">{meeting.time}</span>
                    <span className="interview-meeting-person">{meeting.person}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="interview-right-section">
          {/* To Do Section */}
          <div className="interview-card">
            <h2>To do</h2>
            <ul className="interview-todo-list">
              <li className="interview-todo-item">
                <span className="interview-bullet">•</span>
                Refine the chosen design and prepare for the prototyping stage.
              </li>
              <li className="interview-todo-item">
                <span className="interview-bullet">•</span>
                Conduct a competitive analysis to inform the pricing model.
              </li>
            </ul>
          </div>

          {/* Recent Meetings */}
          <div className="interview-card">
            <h2>Recent meetings</h2>
            {recentMeetings.map(meeting => (
              <div key={meeting.id} className="interview-recent-meeting">
                <div className="interview-recent-title">{meeting.title}</div>
                <div className="interview-recent-meta">
                  <span className="interview-recent-date">{meeting.date}</span>
                  <span className="interview-recent-duration">{meeting.duration}</span>
                </div>
                <p className="interview-recent-description">{meeting.description}</p>
                <div className="interview-divider"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="interview-start-button-container">
        <button className="interview-start-button">Startup page</button>
      </div>
    </div>
  );
};

export default ScheduleInterviewPage;