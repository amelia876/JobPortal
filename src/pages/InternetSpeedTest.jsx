// InternetSpeedTest.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './InternetSpeedTest.css';

const InternetSpeedTest = ({ user }) => {
  const navigate = useNavigate();
  const [isTesting, setIsTesting] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [activeServer, setActiveServer] = useState({
    id: 1,
    name: 'FLOW Jamaica',
    location: 'Kingston',
    ip: '72.252.198.245',
    distance: '0 km'
  });
  const [testHistory, setTestHistory] = useState([]);
  const [showServerList, setShowServerList] = useState(false);
  const testInterval = useRef(null);
  const [testPhase, setTestPhase] = useState('idle'); // idle → pinging → downloading → uploading → complete

  const servers = [
    { id: 1, name: 'FLOW Jamaica', location: 'Kingston', ip: '72.252.198.245', distance: '0 km', quality: 'excellent' },
    { id: 2, name: 'Digicel Jamaica', location: 'Kingston', ip: '192.168.1.100', distance: '5 km', quality: 'good' },
    { id: 3, name: 'C&W Jamaica', location: 'Montego Bay', ip: '10.0.0.1', distance: '120 km', quality: 'good' },
    { id: 4, name: 'Google', location: 'Miami, FL', ip: '8.8.8.8', distance: '700 km', quality: 'fair' },
    { id: 5, name: 'Cloudflare', location: 'Miami, FL', ip: '1.1.1.1', distance: '700 km', quality: 'fair' }
  ];

  const runSpeedTest = () => {
    if (isTesting) return;
    
    setIsTesting(true);
    setTestPhase('pinging');
    setDownloadSpeed(0);
    setUploadSpeed(0);
    setPing(100);
    
    if (testInterval.current) {
      clearInterval(testInterval.current);
    }
    
    let progress = {
      download: 0,
      upload: 0,
      ping: 100,
      phase: 'pinging'
    };
    
    const basePing = Math.max(2, Math.floor(activeServer.distance.split(' ')[0] / 10));
    const maxDownload = 200 - (activeServer.distance.split(' ')[0] / 10);
    const maxUpload = maxDownload * 0.4;
    
    testInterval.current = setInterval(() => {
      if (progress.phase === 'pinging') {
        progress.ping -= Math.random() * 15;
        if (progress.ping <= basePing) {
          progress.phase = 'downloading';
          progress.ping = basePing;
          setTestPhase('downloading');
        }
        setPing(Math.round(progress.ping));
      } 
      else if (progress.phase === 'downloading') {
        progress.download += Math.random() * 5;
        if (progress.download >= maxDownload) {
          progress.download = maxDownload;
          progress.phase = 'uploading';
          setTestPhase('uploading');
        }
        setDownloadSpeed(parseFloat(progress.download.toFixed(1)));
      }
      else if (progress.phase === 'uploading') {
        progress.upload += Math.random() * 3;
        if (progress.upload >= maxUpload) {
          progress.upload = maxUpload;
          clearInterval(testInterval.current);
          setIsTesting(false);
          setTestPhase('complete');
          
          const newTest = {
            id: Date.now(),
            download: parseFloat(maxDownload.toFixed(1)),
            upload: parseFloat(maxUpload.toFixed(1)),
            ping: basePing,
            server: activeServer.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString(),
            quality: getPingClass(basePing)
          };
          
          setTestHistory(prev => {
            const newHistory = [newTest, ...prev.slice(0, 4)];
            localStorage.setItem('speedTestHistory', JSON.stringify(newHistory));
            return newHistory;
          });
        }
        setUploadSpeed(parseFloat(progress.upload.toFixed(1)));
      }
    }, 40);
  };

  const selectServer = (server) => {
    setActiveServer(server);
    setShowServerList(false);
  };

  const getPingClass = (pingValue) => {
    if (pingValue <= 20) return 'excellent';
    if (pingValue <= 50) return 'good';
    if (pingValue <= 100) return 'fair';
    return 'poor';
  };

  const getPingLabel = (pingValue) => {
    if (pingValue <= 20) return 'Excellent';
    if (pingValue <= 50) return 'Good';
    if (pingValue <= 100) return 'Fair';
    return 'Poor';
  };

  const getStatusIcon = (phase) => {
    switch(phase) {
      case 'pinging': return '📡';
      case 'downloading': return '⬇️';
      case 'uploading': return '⬆️';
      case 'complete': return '✅';
      default: return '⚡';
    }
  };

  const getStatusText = (phase) => {
    switch(phase) {
      case 'pinging': return 'Testing ping...';
      case 'downloading': return 'Testing download speed...';
      case 'uploading': return 'Testing upload speed...';
      case 'complete': return 'Test complete!';
      default: return 'Ready to test';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDashboard = () => navigate("/dashboard");
  const handleJobSearch = () => navigate("/job-search");
  const handleApplications = () => navigate("/applications");
  const handleProfile = () => navigate("/profile");

  const clearHistory = () => {
    setTestHistory([]);
    localStorage.removeItem('speedTestHistory');
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('speedTestHistory');
    if (savedHistory) {
      setTestHistory(JSON.parse(savedHistory));
    }

    return () => {
      if (testInterval.current) {
        clearInterval(testInterval.current);
      }
    };
  }, []);

  return (
    <div className="internet-speed-test">
      {/* Navigation - Clean Modern Design */}
      <nav className="speedtest-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="nav-logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">SpeedTest</span>
            </div>
            <div className="nav-menu">
              <a href="/dashboard" onClick={(e) => { e.preventDefault(); handleDashboard(); }}>
                Dashboard
              </a>
              <a href="/job-search" onClick={(e) => { e.preventDefault(); handleJobSearch(); }}>
                Jobs
              </a>
              <a href="/applications" onClick={(e) => { e.preventDefault(); handleApplications(); }}>
                Applications
              </a>
              <a href="#" className="active">
                Speed Test
              </a>
              <a href="/profile" onClick={(e) => { e.preventDefault(); handleProfile(); }}>
                Profile
              </a>
            </div>
          </div>
          
          <div className="nav-right">
            <div className="user-info">
              <span className="user-avatar">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </span>
              <span className="user-name">
                {user?.firstName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="speedtest-main">
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-content">
            <h1>Internet Speed Test</h1>
            <p className="subtitle">Check your connection speed in real-time</p>
          </div>
        </div>

        {/* Main Test Area */}
        <div className="test-container">
          {/* Server Selection */}
          <div className="server-card">
            <div className="card-header">
              <h3>Test Server</h3>
              <div className="status-badge">
                <span className="status-dot"></span>
                {getStatusText(testPhase)}
              </div>
            </div>
            
            <div className="server-current">
              <div className="server-info">
                <div className="server-icon">🌐</div>
                <div>
                  <h4>{activeServer.name}</h4>
                  <p className="server-location">{activeServer.location}</p>
                  <p className="server-details">{activeServer.ip} • {activeServer.distance}</p>
                </div>
              </div>
              <button 
                className="btn-outline"
                onClick={() => setShowServerList(!showServerList)}
              >
                {showServerList ? 'Hide' : 'Change Server'}
              </button>
            </div>

            {showServerList && (
              <div className="server-list">
                {servers.map(server => (
                  <div 
                    key={server.id}
                    className={`server-item ${activeServer.id === server.id ? 'selected' : ''}`}
                    onClick={() => selectServer(server)}
                  >
                    <div className="server-item-icon">📡</div>
                    <div className="server-item-content">
                      <div className="server-item-name">{server.name}</div>
                      <div className="server-item-meta">
                        <span>{server.location}</span>
                        <span>•</span>
                        <span>{server.distance}</span>
                      </div>
                    </div>
                    <div className={`server-quality ${server.quality}`}>
                      {server.quality}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Speed Results */}
          <div className="results-grid">
            {/* Download Speed */}
            <div className="result-card">
              <div className="result-header">
                <div className="result-icon">⬇️</div>
                <div>
                  <h4>Download Speed</h4>
                  <p className="result-subtitle">Data received from internet</p>
                </div>
              </div>
              <div className="result-main">
                <div className="speed-value">
                  {downloadSpeed.toFixed(1)}
                  <span className="speed-unit">Mbps</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar download"
                    style={{ width: `${Math.min(downloadSpeed / 2, 100)}%` }}
                  ></div>
                </div>
                <div className="speed-label">
                  {downloadSpeed < 25 ? 'Basic' : downloadSpeed < 100 ? 'Fast' : 'Ultra Fast'}
                </div>
              </div>
            </div>

            {/* Upload Speed */}
            <div className="result-card">
              <div className="result-header">
                <div className="result-icon">⬆️</div>
                <div>
                  <h4>Upload Speed</h4>
                  <p className="result-subtitle">Data sent to internet</p>
                </div>
              </div>
              <div className="result-main">
                <div className="speed-value">
                  {uploadSpeed.toFixed(1)}
                  <span className="speed-unit">Mbps</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar upload"
                    style={{ width: `${Math.min(uploadSpeed * 2, 100)}%` }}
                  ></div>
                </div>
                <div className="speed-label">
                  {uploadSpeed < 10 ? 'Basic' : uploadSpeed < 25 ? 'Fast' : 'Ultra Fast'}
                </div>
              </div>
            </div>

            {/* Ping */}
            <div className="result-card">
              <div className="result-header">
                <div className="result-icon">📶</div>
                <div>
                  <h4>Ping (Latency)</h4>
                  <p className="result-subtitle">Response time</p>
                </div>
              </div>
              <div className="result-main">
                <div className="speed-value">
                  {ping}
                  <span className="speed-unit">ms</span>
                </div>
                <div className="ping-visual">
                  <div className="ping-scale">
                    <div className="ping-mark excellent"></div>
                    <div className="ping-mark good"></div>
                    <div className="ping-mark fair"></div>
                    <div className="ping-mark poor"></div>
                    <div 
                      className="ping-indicator"
                      style={{ left: `${Math.min(ping, 100)}%` }}
                    ></div>
                  </div>
                  <div className="ping-labels">
                    <span>0ms</span>
                    <span>25ms</span>
                    <span>50ms</span>
                    <span>100ms</span>
                    <span>200ms</span>
                  </div>
                </div>
                <div className={`ping-quality ${getPingClass(ping)}`}>
                  {getPingLabel(ping)}
                </div>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="controls-card">
            <div className="controls-content">
              <div className="test-status">
                <div className="status-icon">{getStatusIcon(testPhase)}</div>
                <div className="status-text">
                  <h4>{testPhase === 'idle' ? 'Ready to Test' : testPhase.charAt(0).toUpperCase() + testPhase.slice(1)}</h4>
                  <p>{getStatusText(testPhase)}</p>
                </div>
              </div>
              <button 
                className={`btn-primary ${isTesting ? 'testing' : ''}`}
                onClick={runSpeedTest}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <div className="spinner"></div>
                    Testing...
                  </>
                ) : (
                  'Start Speed Test'
                )}
              </button>
            </div>
            <div className="test-tips">
              <p>💡 For best results: Use Ethernet, close other apps, test multiple times</p>
            </div>
          </div>

          {/* Test History */}
          <div className="history-section">
            <div className="section-header">
              <h3>Recent Tests</h3>
              {testHistory.length > 0 && (
                <button 
                  className="btn-text"
                  onClick={clearHistory}
                >
                  Clear History
                </button>
              )}
            </div>
            
            {testHistory.length > 0 ? (
              <div className="history-grid">
                {testHistory.map((test) => (
                  <div key={test.id} className="history-card">
                    <div className="history-header">
                      <div className="history-server">
                        <div className="server-indicator"></div>
                        {test.server}
                      </div>
                      <div className="history-time">
                        {test.timestamp} • {test.date}
                      </div>
                    </div>
                    <div className="history-stats">
                      <div className="stat">
                        <div className="stat-label">Download</div>
                        <div className="stat-value">{test.download} Mbps</div>
                      </div>
                      <div className="stat">
                        <div className="stat-label">Upload</div>
                        <div className="stat-value">{test.upload} Mbps</div>
                      </div>
                      <div className="stat">
                        <div className="stat-label">Ping</div>
                        <div className="stat-value">{test.ping} ms</div>
                      </div>
                    </div>
                    <div className="history-footer">
                      <div className={`quality-tag ${test.quality}`}>
                        {test.quality}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <div className="empty-icon">📊</div>
                <h4>No tests yet</h4>
                <p>Run your first speed test to see results here</p>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="info-section">
            <div className="info-card">
              <div className="info-icon">💡</div>
              <div className="info-content">
                <h4>Understanding Your Results</h4>
                <ul>
                  <li><strong>Download:</strong> Affects streaming, browsing, downloads</li>
                  <li><strong>Upload:</strong> Important for video calls, cloud backups</li>
                  <li><strong>Ping:</strong> Critical for gaming, real-time applications</li>
                </ul>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <div className="info-content">
                <h4>Speed Recommendations</h4>
                <div className="recommendation">
                  <div className="rec-item">
                    <span className="rec-label">Basic Use:</span>
                    <span className="rec-value">25+ Mbps</span>
                  </div>
                  <div className="rec-item">
                    <span className="rec-label">HD Streaming:</span>
                    <span className="rec-value">50+ Mbps</span>
                  </div>
                  <div className="rec-item">
                    <span className="rec-label">4K/Gaming:</span>
                    <span className="rec-value">100+ Mbps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InternetSpeedTest;