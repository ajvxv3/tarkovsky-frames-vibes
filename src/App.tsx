import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import './App.css';

// Move the photo viewer into its own component
function MovieNav({ currentMovie }: { currentMovie: string }) {
  const navigate = useNavigate();
  const movies = ['stalker', 'solaris', 'mirror', 'nostalghia', 'sacrifice'];
  const START_FRAME = 1;

  const getButtonText = (movie: string) => {
    if (movie === 'sacrifice') {
      return 'The SacrifIce';
    }
    return movie.charAt(0).toUpperCase() + movie.slice(1);
  };

  return (
    <nav className="movie-nav">
      {movies.map((movie) => (
        <button
          key={movie}
          className={`nav-tab ${movie === currentMovie ? 'active' : ''}`}
          onClick={() => navigate(`/${movie}/${START_FRAME}`)}
        >
          {getButtonText(movie)}
        </button>
      ))}
    </nav>
  );
}

function SocialLinks() {
  return (
    <div className="social-links">
      <a href="https://x.com/tarkovskyframes" target="_blank" rel="noopener noreferrer">𝕏</a>
      <a href="https://bsky.app/profile/tarkovskyframes.bsky.social" target="_blank" rel="noopener noreferrer">⋒</a>
    </div>
  );
}

function PhotoViewer({ movie, initialFrame }: { movie: string; initialFrame?: number }) {
  const BASE_URL = `https://tarkovsky-frames.s3.us-west-1.amazonaws.com/${movie}/${movie}_`;
  const START_FRAME = 1;
  const navigate = useNavigate();

  // Determine padding based on movie
  const getPaddedNumber = (num: number) => {
    if (movie === 'stalker') {
      return String(num).padStart(5, '0'); 
    }
    return String(num).padStart(4, '0');
  };

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [frameInput, setFrameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update initialFrame handling
  useEffect(() => {
    if (initialFrame) {
      setCurrentPhotoIndex(initialFrame - START_FRAME);
      setErrorMessage(null);
    } else {
      setCurrentPhotoIndex(0);
    }
  }, [initialFrame, movie]); // Add movie as dependency to handle movie changes

  const goToPrevious = React.useCallback(() => {
    const newIndex = Math.max(0, currentPhotoIndex - 1);
    const frameNumber = START_FRAME + newIndex;
    setCurrentPhotoIndex(newIndex);
    navigate(`/${movie}/${frameNumber}`);
    setErrorMessage(null);
  }, [currentPhotoIndex, movie, navigate]);

  const goToNext = React.useCallback(() => {
    const newIndex = currentPhotoIndex + 1;
    const frameNumber = START_FRAME + newIndex;
    setCurrentPhotoIndex(newIndex);
    navigate(`/${movie}/${frameNumber}`);
    setErrorMessage(null);
  }, [currentPhotoIndex, movie, navigate]);

  // Update keyboard navigation effect with dependencies
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [goToPrevious, goToNext]);

  const getPhotoUrl = (index: number) => {
    return `${BASE_URL}${getPaddedNumber(START_FRAME + index)}.png`;
  };

  const handleFrameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const frameNumber = parseInt(frameInput);
    if (frameNumber >= START_FRAME) {
      const index = frameNumber - START_FRAME;
      setCurrentPhotoIndex(index);
      setErrorMessage(null);
      navigate(`/${movie}/${frameNumber}`);
    } else {
      setErrorMessage(`Please enter a frame number greater than ${START_FRAME}`);
    }
    setFrameInput('');
  };

  const handleImageError = () => {
    setErrorMessage(`Frame ${START_FRAME + currentPhotoIndex} does not exist`);
  };

  const handleRandomFrame = () => {
    const randomFrame = Math.floor(Math.random() * (6000 - 200 + 1)) + 200;
    setCurrentPhotoIndex(randomFrame - START_FRAME);
    navigate(`/${movie}/${randomFrame}`);
    setErrorMessage(null);
  };

  return (
    <div className="App">
      <SocialLinks />
      <MovieNav currentMovie={movie} />
      <h1 className="title">Tarkovsky Frames: {movie}</h1>
      <div className="photo-viewer">
        <button className="nav-button prev" onClick={goToPrevious}>
          ←
        </button>
        {errorMessage ? (
          <div className="error-message">{errorMessage}</div>
        ) : (
          <img 
            key={currentPhotoIndex}
            src={getPhotoUrl(currentPhotoIndex)} 
            alt={`Frame ${START_FRAME + currentPhotoIndex}`}
            className="photo"
            onError={handleImageError}
          />
        )}
        <button className="nav-button next" onClick={goToNext}>
          →
        </button>
      </div>
      <div className="frame-input">
        <form onSubmit={handleFrameSubmit}>
          <input
            type="number"
            value={frameInput}
            onChange={(e) => setFrameInput(e.target.value)}
            placeholder="frame number"
            min={START_FRAME}
          />
          <button type="submit">Go to Frame</button>
          <button type="button" onClick={handleRandomFrame} className="random-button">
            Random Frame
          </button>
        </form>
      </div>
    </div>
  );
}

// Update MovieViewer to ensure frame is properly passed
function MovieViewer() {
  const params = useParams();
  const movie = params.movie || 'stalker';
  const frame = params.frame ? parseInt(params.frame) : 1; // Default to frame 1 instead of undefined
  
  return <PhotoViewer movie={movie} initialFrame={frame} />;
}

// Main App component with routing
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhotoViewer movie="stalker" />} />
        <Route path="/:movie" element={<MovieViewer />} />
        <Route path="/:movie/:frame" element={<MovieViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
