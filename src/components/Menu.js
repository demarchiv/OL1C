import React, { useContext, useCallback, useState  } from 'react';
//import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ReactComponent as HomeIcon } from '../assets/icons/home-icon.svg'; // Adjust the path as necessary
import { ReactComponent as GoBackIcon } from '../assets/icons/go-back-icon.svg'; // Adjust the path as necessary
import { StateContext } from "../State";
import { ReactComponent as ArrowIcon } from '../assets/icons/arrow-icon.svg'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';
import { getLabelsTexts, getButtonTooltip } from '../utils/DataExtraction.js';
import { replaceBoldsItalicBreaks3 } from '../utils/TextFormatting.js';
import '../styles/components/Menu.css';

const Menu = () => {
  const {
    language,
    firstUse,
    setFirstUse,
    showExplanation,
    setShowExplanation,
    setShowInstruction,
    showStudyInstruction,
    setShowStudyInstruction
  } = useContext(StateContext);

  const labelsTexts = getLabelsTexts(language, "menu");
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate(); // Initialize the navigate function

  // Tooltip
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  let tooltipTimeout = null;
  const buttonTooltips = getButtonTooltip(language);

  // Determine the active button based on the current path
  const getActiveButton = (path) => {
    switch (path) {
      case '/':
        return 'intro-page';
      case '/home':
        return 'home';
      case '/get-started':
        return 'get-started';
      case '/learn':
        return 'learn';
      case '/learn2':
        return 'learn2';
      case '/get-inspired':
        return 'get-inspired';
      case '/map':
        return 'map';
      case '/map2':
        return 'map2';
      case '/contribute':
        return 'contribute';
      case '/contextualize':
        return 'contextualize';
      case '/compare':
        return 'compare';
      default:
        return null;
    }
  };
  
  const activeButton = getActiveButton(currentPath);
  const menuExpanded = (activeButton === 'home' || showExplanation);

  // useEffect(() => {
  //   if ((firstUse["home"] && activeButton === 'home')) {
  //     const timer = setTimeout(() => {
  //       setShowStudyInstruction(true);
  //     }, 1000); // 5 seconds delay
  //     return () => clearTimeout(timer); // Cleanup the timer on unmount
  //   }
  // }, [firstUse, activeButton, setShowStudyInstruction]); // Depend on firstUserVariable
  
  const handleShowStudyInstruction = (value) => {
    if(firstUse["home"])
      setFirstUse(prevState => ({
        ...prevState, // Keep all existing attributes
        home: false   // Update only 'home'
      }));
    setShowStudyInstruction(value);
  };

  const handleHomeClick = () => {
    setShowExplanation(true); // Reset to initial state when the page changes
    setShowInstruction(false);
  };

  const handlePrevPage = useCallback(() => {
    setShowExplanation(false); // Reset to initial state when the page changes

    if(activeButton === "learn2") 
      return;
    else if(activeButton === "get-inspired") {
      if(firstUse["learn"])
        setShowInstruction(true); // Reset to initial state when the page changes
      else
        setShowInstruction(false); // Reset to initial state when the page changes

      navigate('/learn2');
    }
    else if(activeButton === "map2") {
      if(firstUse["get-inspired"])
        setShowInstruction(true); // Reset to initial state when the page changes
      else
        setShowInstruction(false); // Reset to initial state when the page changes

      navigate('/get-inspired');
    }
  }, [navigate, setShowInstruction, setShowExplanation, activeButton, firstUse]);

  const handleNextPage = useCallback(() => {
    setShowExplanation(false); // Reset to initial state when the page changes
    setShowInstruction(false); // Reset to initial state when the page changes
  
    if(activeButton === "learn2") {
      if(firstUse["get-inspired"])
        setShowInstruction(true); // Reset to initial state when the page changes
      else
        setShowInstruction(false); // Reset to initial state when the page changes
  
      navigate('/get-inspired');
    } else if(activeButton === "get-inspired") {
      if(firstUse["map"])
        setShowInstruction(true); // Reset to initial state when the page changes
      else
        setShowInstruction(false); // Reset to initial state when the page changes
  
      navigate('/map2');
    } else if(activeButton === "map2") 
      return;
  }, [navigate, setShowInstruction, setShowExplanation, activeButton, firstUse]);

  const handleMouseEnter = (e, text) => {
    console.log(text);
    clearTimeout(tooltipTimeout);

      // Set a timeout to delay the appearance of the tooltip by 1 second
      tooltipTimeout = setTimeout(() => {
          setTooltipPos({ x: e.clientX, y: e.clientY });
          setTooltipText(text);
          setTooltipVisible(true);
      }, 0); // 1-second delay
      return;
  };

  // Other Components
  const Tooltip = ({ text, position }) => (
    <div
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, -110%)', // Adjusts the position above the button
        zIndex: 1000,
        backgroundColor: '#acaaaa', // Tooltip background color
        color: 'white', // Tooltip text color
        padding: '1vh', // Padding inside the tooltip
        borderRadius: '0.5vh', // Rounded corners
        fontFamily: 'Manrope',
        fontSize: '2vh',
        fontWeight: '400',
        width: `${text.length * 0.65}vh`, // Dynamic width based on text length
        pointerEvents: 'none', // Prevents tooltip from interfering with hover
        opacity: 0.9
      }}
    >
      {text}
      {/* Tooltip pointer */}
      <div
        style={{
          position: 'fixed',
          top: '100%', // Positions pointer below the tooltip box
          left: '50%',
          marginLeft: '-1vh', // Centers the pointer
          width: '0',
          height: '0',
          borderLeft: '1vh solid transparent',
          borderRight: '1vh solid transparent',
          borderTop: '2vh solid #acaaaa', // Matches tooltip background
          opacity: 0.9
        }}
      />
    </div>
  );
    
  return (
    <div>
       {showStudyInstruction && (
        <div className="menu-message-box">
          <div className="menu-message-question">
            {labelsTexts["study-instructions"]}
          </div>
          {replaceBoldsItalicBreaks3(
            labelsTexts["study-instructions-text"],
          'menu-message-text', 'menu-message-text bold', 'menu-message-text italic')}
          <button 
            className="menu-got-it-button" 
            onClick={() => handleShowStudyInstruction(false)}
          >
            {labelsTexts["ok-got-it"]}
          </button>
        </div>
      )}
      <Link
        to="/home"
        className={`circle-button home ${activeButton === 'home' ? 'active' : ''}`}
        onClick={handleHomeClick}
      >
        <HomeIcon 
          className="home-icon" 
        />
      </Link>
      <Link
        to="/"
        className={`circle-button go-back ${activeButton === 'intro-page' ? 'active' : ''}`}
        onMouseEnter={(e) => {handleMouseEnter(e, buttonTooltips.ReplayIntro)}}
        onMouseLeave={() => {setTooltipVisible(false)}}
      >
        <GoBackIcon 
          className="go-back-icon" 
        />
      </Link>
      {/* {(!firstUse["home"] || activeButton !== 'home') &&
        <button 
          className='menu-study-instructions'
          onClick={() => handleShowStudyInstruction(true)}
          onMouseEnter={(e) => {handleMouseEnter(e, buttonTooltips.StudyInstructions)}}
          onMouseLeave={() => {setTooltipVisible(false)}}
        >
            {labelsTexts["study-instructions"]}
        </button>
      } */}
      {!menuExpanded &&
          <>
          <div className='menu-arrow-container'>
            <button
              className={`menu-arrow-button left ${activeButton === "learn2" ? "disabled" : ""}`}
              onClick={handlePrevPage}
            >
              <ArrowIcon className='menu-arrow-icon' />
            </button>
            <button
              className={`menu-arrow-button right ${activeButton === "map2" ? "disabled" : ""}`}
              onClick={handleNextPage}
            >
              <ArrowIcon className='menu-arrow-icon' />
            </button>
          </div>
          </>
      }
      <div className="left-menu">
        {menuExpanded && 
          <div className='i-want-to-text'>
            {labelsTexts["lets"]}
          </div>
        }
        
        {(menuExpanded || activeButton === 'learn2') && 
          <Link
            to="/learn2"
            className={`menu-button ${menuExpanded ? '' : 'solo'} 
              ${activeButton === 'learn2' && !showExplanation ? 'active' : ''} 
              ${activeButton === 'learn2' && showExplanation ? 'semi-active' : ''}`}
          >
            {labelsTexts["learn"]}
          </Link>
        }
        
        {(menuExpanded || activeButton === 'get-inspired') && 
          <Link
            to="/get-inspired"
            className={`menu-button ${menuExpanded ? '' : 'solo'} 
              ${activeButton === 'get-inspired' && !showExplanation ? 'active' : ''} 
              ${activeButton === 'get-inspired' && showExplanation ? 'semi-active' : ''}`}
          >
            {labelsTexts["get-inspired"]}
          </Link>
        }

        {(menuExpanded || activeButton === 'map2') && 
          <Link
            to="/map2"
            className={`menu-button ${menuExpanded ? '' : 'solo'} 
              ${activeButton === 'map2' && !showExplanation ? 'active' : ''} 
              ${activeButton === 'map2' && showExplanation ? 'semi-active' : ''}`}
          >
            {labelsTexts["map"]}
          </Link>
        }
        {/* <div className='guideline-1'></div>
        <div className='guideline-2'></div>
        <div className='guideline-3'></div>
        <div className='guideline-4'></div>
        <div className='guideline-5'></div>
        <div className='guideline-6'></div>
        <div className='guideline-7'></div>
        <div className='guideline-8'></div>
        <div className='guideline-9'></div>
        <div className='guideline-10'></div>
        <div className='guideline-11'></div> */}
        {tooltipVisible && 
          <Tooltip 
            text={tooltipText} 
            position={tooltipPos} 
          />
        }
        {/*  (menuExpanded || activeButton === 'map') && 
          <Link
            to="/map"
            className={`menu-button ${menuExpanded ? '' : 'solo'} ${activeButton === 'map' ? 'active' : ''}`}
          >
            MAP
          </Link>
        }
        {{showMore && (
          <>
            {(menuExpanded || activeButton === 'get-started') && 
            <Link
              to="/get-started"
              className={`menu-button ${menuExpanded ? '' : 'solo'} ${activeButton === 'get-started' ? 'active' : ''}`}
            >
              GET STARTED
            </Link>
          }
            {(menuExpanded || activeButton === 'contribute') && 
          <Link
            to="/contribute"
            className={`menu-button ${menuExpanded ? '' : 'solo'} ${activeButton === 'contribute' ? 'active' : ''}`}
          >
            CONTRIBUTE
          </Link>
        }
            {(menuExpanded || activeButton === 'learn') && 
              <Link
                to="/learn"
                className={`menu-button ${menuExpanded ? '' : 'solo'} ${activeButton === 'learn' ? 'active' : 'disabled'}`}
              >
                LEARN
              </Link>
            }
            {(menuExpanded || activeButton === 'contextualize') && 
              <Link
                to="/contextualize"
                className={`menu-button ${menuExpanded ? '' : 'solo'} ${activeButton === 'contextualize' ? 'active' : 'disabled'}`}
              >
                CONTEXTUALIZE
              </Link>
            }
            {(menuExpanded || activeButton === 'compare') && 
              <Link
                to="/compare"
                className={`menu-button ${menuExpanded ? '' : 'solo'} ${activeButton === 'compare' ? 'active' : 'disabled'}`}
              >
                COMPARE
              </Link>
            }
          </>
        )}
        {(menuExpanded) && 
          <button onClick={toggleShowMore} className="menu-button show-more">
            {showMore ? '-' : '+'}
          </button>
        } */}
      </div>
      {menuExpanded &&
        <div className='menu-background'></div>
      }
    </div>
  );
};

export default Menu;
